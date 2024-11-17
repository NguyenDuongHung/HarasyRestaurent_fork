package group5.swp.HarasyProject.service;


import group5.swp.HarasyProject.dto.request.order.OrderRequest;
import group5.swp.HarasyProject.dto.response.ApiResponse;
import group5.swp.HarasyProject.dto.response.order.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface BusinessManagementService {
    ApiResponse<Page<OrderResponse>> getAllOrders(Pageable pageable);
    ApiResponse<List<OrderResponse>> getAllInTimeOrders(int branchId);
    ApiResponse<OrderResponse> getOrder(int orderId);

    ApiResponse<OrderResponse> createOrder(OrderRequest orderRequest);
    ApiResponse<OrderResponse> updateOrder(int orderId,OrderRequest orderRequest);

}