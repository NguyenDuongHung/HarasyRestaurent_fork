import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import useBranchApi from "../hooks/api/useBranchApi";
import uploadImage from "../services/uploadImage";
import { toast, ToastContainer } from "react-toastify";

const CreateBranch = () => {
  const navigate = useNavigate();
  const { createBranch, getBranchManagers } = useBranchApi();

  const { data: managers = [], isLoading: isLoadingManagers } = useQuery({
    queryKey: ["branchManagers"],
    queryFn: getBranchManagers,
    onError: (error) => {
      toast.error(`Failed to fetch managers: ${error.message}`);
    },
  });
  const uploadImageMutate = useMutation({
    mutationFn: uploadImage,
    onSuccess: (data) => {
      toast.success("Image uploaded successfully!");
      handleCreateBranch(data);
    },
    onError: (error) => {
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });

  const saveBranchMutate = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      toast.success("Branch created successfully!");
      navigate("/branch");
    },
    onError: (error) => {
      toast.error(`Failed to create branch: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    imageFile: null,
    phone: "",
    managerId: "",
    status: "",
    workingHours: [{ dayOfWeek: "", openingTime: "", closingTime: "" }],
    tables: [{ number: "", capacity: "", status: "AVAILABLE" }],
    menus: [{ type: "" }],
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateBranch = (imageUrl) => {
    // Validate working hours before submission
    const validWorkingHours = formData.workingHours.filter(
      (hour) => hour.dayOfWeek && hour.openingTime && hour.closingTime
    );

    const payload = {
      name: formData.name,
      location: formData.location,
      image: imageUrl,
      phone: formData.phone,
      managerId: formData.managerId,
      status: formData.status,
      workingHours: validWorkingHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        openingTime:
          hour.openingTime.length === 5
            ? `${hour.openingTime}:00`
            : hour.openingTime,
        closingTime:
          hour.closingTime.length === 5
            ? `${hour.closingTime}:00`
            : hour.closingTime,
      })),
      tables: formData.tables.map((table) => ({
        number: table.number,
        capacity: table.capacity,
      })),
      menus: formData.menus.map((menu) => ({
        type: menu.type,
      })),
    };

    saveBranchMutate.mutate(payload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.length > 50) {
      toast.error("Branch Name cannot exceed 50 characters.");
      return;
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Enter a valid phone number (10-15 digits).");
      return;
    }

    for (let i = 0; i < formData.workingHours.length; i++) {
      const { dayOfWeek, openingTime, closingTime } = formData.workingHours[i];
      if (!dayOfWeek || !openingTime || !closingTime) {
        toast.error(
          "All working hours must have day, opening, and closing times."
        );
        return;
      }
      if (openingTime >= closingTime) {
        toast.error("Opening time must be earlier than closing time.");
        return;
      }
    }

    for (let i = 0; i < formData.tables.length; i++) {
      const { number, capacity } = formData.tables[i];
      if (!number || !capacity) {
        toast.error("All tables must have a number and capacity.");
        return;
      }
      if (isNaN(capacity) || Number(capacity) <= 0) {
        toast.error("Table capacity must be a valid positive number.");
        return;
      }
    }

    for (let i = 0; i < formData.menus.length; i++) {
      if (!formData.menus[i].type) {
        toast.error("All menus must have a type.");
        return;
      }
    }

    if (formData.imageFile) {
      uploadImageMutate.mutate(formData.imageFile);
    } else {
      handleCreateBranch("");
    }
  };

  const addWorkingHour = () => {
    setFormData((prev) => {
      const previousDay = prev.workingHours[prev.workingHours.length - 1];
      const newDay = {
        dayOfWeek: "",
        openingTime: previousDay ? previousDay.openingTime : "",
        closingTime: previousDay ? previousDay.closingTime : "",
      };
      return {
        ...prev,
        workingHours: [...prev.workingHours, newDay],
      };
    });
  };

  const removeWorkingHour = (index) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index),
    }));
  };

  const addTable = () => {
    setFormData((prev) => ({
      ...prev,
      tables: [...prev.tables, { number: "", capacity: "" }],
    }));
  };

  const removeTable = (index) => {
    setFormData((prev) => ({
      ...prev,
      tables: prev.tables.filter((_, i) => i !== index),
    }));
  };

  const addMenu = () => {
    setFormData((prev) => ({
      ...prev,
      menus: [...prev.menus, { type: "" }],
    }));
  };

  const removeMenu = (index) => {
    setFormData((prev) => ({
      ...prev,
      menus: prev.menus.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="container my-4">
      <h1 className="text-white">Create New Branch</h1>
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Column 1 */}
          <div className="col-12 col-md-6">
            <div className="mb-3">
              <label className="form-label text-white">Branch Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-white">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-white">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-white">Manager</label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="">Select a manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label text-white">Upload Image</label>
              <input
                type="file"
                name="imageFile"
                onChange={handleInputChange}
                className="form-control"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div className="col-12 col-md-6">
            <div className="mb-3">
              <label className="form-label text-white">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Working Hours */}
            <div className="mb-3">
              <label className="form-label text-white">Working Hours</label>
              {formData.workingHours.map((hour, index) => (
                <div key={index} className="d-flex align-items-center  ">
                  <select
                    value={hour.dayOfWeek}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingHours: prev.workingHours.map((h, i) =>
                          i === index ? { ...h, dayOfWeek: e.target.value } : h
                        ),
                      }))
                    }
                    className="form-select me-2"
                  >
                    <option value="">Select Day</option>
                    {[
                      "MONDAY",
                      "TUESDAY",
                      "WEDNESDAY",
                      "THURSDAY",
                      "FRIDAY",
                      "SATURDAY",
                      "SUNDAY",
                    ].map((day) =>
                      !formData.workingHours.some((h) => h.dayOfWeek === day) ||
                      hour.dayOfWeek === day ? (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ) : null
                    )}
                  </select>
                  <input
                    type="time"
                    value={hour.openingTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingHours: prev.workingHours.map((h, i) =>
                          i === index
                            ? { ...h, openingTime: e.target.value }
                            : h
                        ),
                      }))
                    }
                    className="form-control me-2"
                  />
                  <input
                    type="time"
                    value={hour.closingTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        workingHours: prev.workingHours.map((h, i) =>
                          i === index
                            ? { ...h, closingTime: e.target.value }
                            : h
                        ),
                      }))
                    }
                    className="form-control me-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeWorkingHour(index)}
                    className="btn btn-danger btn-sm  ms-auto "
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addWorkingHour}
                className="btn btn-secondary btn-sm mt-2"
              >
                Add Working Hour
              </button>
            </div>

            {/* Tables */}
            <div className="mb-3">
              <label className="form-label text-white">Tables</label>
              {formData.tables.map((table, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <input
                    type="text"
                    placeholder="Table Number"
                    value={table.number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tables: prev.tables.map((t, i) =>
                          i === index ? { ...t, number: e.target.value } : t
                        ),
                      }))
                    }
                    className="form-control me-2"
                  />
                  <input
                    type="text"
                    placeholder="Capacity"
                    value={table.capacity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tables: prev.tables.map((t, i) =>
                          i === index ? { ...t, capacity: e.target.value } : t
                        ),
                      }))
                    }
                    className="form-control me-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeTable(index)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTable}
                className="btn btn-secondary btn-sm mt-2"
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
        {/* Menus */}
        <div className="mb-3">
          <label className="form-label text-white">Menus</label>
          {formData.menus.map((menu, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <select
                value={menu.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    menus: prev.menus.map((m, i) =>
                      i === index ? { ...m, type: e.target.value } : m
                    ),
                  }))
                }
                className="form-select me-2"
              >
                <option value="">Select Menu Type</option>
                {["BREAKFAST", "LUNCH", "DINNER", "DESSERT"].map((type) =>
                  !formData.menus.some((m) => m.type === type) ||
                  menu.type === type ? (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ) : null
                )}
              </select>
              <button
                type="button"
                onClick={() => removeMenu(index)}
                className="btn btn-danger btn-sm"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMenu}
            className="btn btn-secondary btn-sm mt-2"
          >
            Add Menu
          </button>
        </div>
        <button type="submit" className="btn btn-primary mt-4">
          Create Branch
        </button>
        <ToastContainer position="top-right" autoClose={3000} />
      </form>
    </div>
  );
};

export default CreateBranch;
