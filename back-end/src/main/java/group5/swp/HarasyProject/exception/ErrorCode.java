package group5.swp.HarasyProject.exception;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public enum ErrorCode {
    //Authenticate:
    UNAUTHENTICATED(5000, "unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(5001, "you not have permission", HttpStatus.FORBIDDEN),
    TOKEN_EXPIRED(5003,"expired token", HttpStatus.UNAUTHORIZED),
    TOKEN_REVOKED(5004,"revoked token", HttpStatus.UNAUTHORIZED),
    INVALID_OTP(5005, "invalid token", HttpStatus.UNAUTHORIZED),
    OTP_EXPIRED(5006, "expired otp", HttpStatus.UNAUTHORIZED),
    TOKEN_NULL(5007, "token is null", HttpStatus.UNAUTHORIZED),

    ACCOUNT_NOT_ACTIVE(5005, "account not active", HttpStatus.UNAUTHORIZED),

    //NOT FOUND
    ACCOUNT_NOT_FOUND(3000, "account not found", HttpStatus.NOT_FOUND),
    BRANCH_NOT_FOUND(3001, "branch not found", HttpStatus.NOT_FOUND),
    TABLE_NOT_FOUND(3002, "table not found", HttpStatus.UNAUTHORIZED),
    MENU_NOT_FOUND(3003, "menu not found", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(3004, "categories not found", HttpStatus.NOT_FOUND),
    FOOD_NOT_FOUND(3005, "food not found", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND(3006, "order not found", HttpStatus.NOT_FOUND),
    ORDER_ITEM_NOT_FOUND(3007, "order item not found", HttpStatus.NOT_FOUND),


    //ALREADY EXIST
    TABLE_EXISTED(4000, "table already exist", HttpStatus.CONFLICT),
    BRANCH_EXISTED(4001,"branch name is duplicate",HttpStatus.CONFLICT),
    EMAIL_EXISTED(4002,"Email is already existed",HttpStatus.CONFLICT),

    //SPECIAL
    ORDER_HAVE_NO_TABLE(2000,"cannot create order with no table",HttpStatus.CONFLICT),
    ORDER_WAS_CLOSED(2001,"order was closed",HttpStatus.CONFLICT),
    ;

    int code;
    String message;
    HttpStatus httpStatus;

}