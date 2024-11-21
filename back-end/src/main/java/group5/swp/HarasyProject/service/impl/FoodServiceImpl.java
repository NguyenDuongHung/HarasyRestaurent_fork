package group5.swp.HarasyProject.service.impl;

import group5.swp.HarasyProject.dto.request.food.FoodRequest;
import group5.swp.HarasyProject.dto.response.ApiResponse;
import group5.swp.HarasyProject.dto.response.food.FoodResponse;
import group5.swp.HarasyProject.entity.food.CategoryEntity;
import group5.swp.HarasyProject.entity.food.FoodEntity;
import group5.swp.HarasyProject.enums.BinaryStatus;
import group5.swp.HarasyProject.enums.Status;
import group5.swp.HarasyProject.exception.AppException;
import group5.swp.HarasyProject.exception.ErrorCode;
import group5.swp.HarasyProject.mapper.FoodMapper;
import group5.swp.HarasyProject.repository.CategoryRepository;
import group5.swp.HarasyProject.repository.FoodRepository;
import group5.swp.HarasyProject.repository.MenuItemRepository;
import group5.swp.HarasyProject.service.FoodService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {


    FoodRepository foodRepository;
    CategoryRepository categoryRepository;
    FoodMapper foodMapper;
    MenuItemRepository menuItemRepository;

    @Override
    public ApiResponse<List<FoodResponse>> getAllFood(boolean includeAll) {
        List<FoodEntity> foodList = foodRepository.findAll();
        if (!includeAll)
            foodList = foodList
                    .stream().filter(foodEntity -> !foodEntity.getStatus().equals(Status.DELETED))
                    .toList();
        List<FoodResponse> responseList = foodList
                .stream().map(foodMapper::toResponse)
                .toList();
        return ApiResponse.<List<FoodResponse>>builder()
                .data(responseList)
                .build();
    }


    @Override
    public ApiResponse<FoodResponse> getFood(int id) {
        FoodEntity food = foodRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.FOOD_NOT_FOUND));
        FoodResponse response = foodMapper.toResponse(food);
        return ApiResponse.<FoodResponse>builder()
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<FoodResponse> createFood(FoodRequest request) {
        FoodEntity foodEntity = foodMapper.toEntity(request);
        return getFoodResponseApiResponse(request, foodEntity);
    }

    @Override
    public ApiResponse<FoodResponse> updateFood(int id,FoodRequest request) {
        FoodEntity foodEntity = foodRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.FOOD_NOT_FOUND));
        foodEntity = foodMapper.updateFood(request,foodEntity);
        if(foodEntity.getStatus().equals(Status.INACTIVE)){
            foodEntity.getMenuItems().forEach(item->item.setStatus(BinaryStatus.UNAVAILABLE));
        } else{
            foodEntity.getMenuItems().forEach(item->item.setStatus(BinaryStatus.AVAILABLE));
        }
        return getFoodResponseApiResponse(request, foodEntity);
    }

    private ApiResponse<FoodResponse> getFoodResponseApiResponse(FoodRequest request, FoodEntity foodEntity) {
        if (request.getCategoryId()!=null) {
            CategoryEntity categoryEntity = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(()-> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            foodEntity.setCategory(categoryEntity);
        }
        foodEntity = foodRepository.save(foodEntity);
        FoodResponse response = foodMapper.toResponse(foodEntity);
        return ApiResponse.<FoodResponse>builder()
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<?> deleteFood(int id) {
        FoodEntity foodEntity = foodRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.FOOD_NOT_FOUND));
        foodEntity.setStatus(Status.DELETED);
        foodRepository.save(foodEntity);
        menuItemRepository.deleteByFoodId(id);
        return ApiResponse.builder().build();
    }

    @Override
    public FoodEntity getFoodEntity(int id) {
        return foodRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.FOOD_NOT_FOUND));
    }
}
