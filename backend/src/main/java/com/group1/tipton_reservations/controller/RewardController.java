package com.group1.tipton_reservations.controller;

import com.group1.tipton_reservations.model.User;
import com.group1.tipton_reservations.security.HotelUserPrincipal; 
import com.group1.tipton_reservations.service.StripeService;
import com.group1.tipton_reservations.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final UserService userService;
    private final StripeService stripeService;

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemPoints(@AuthenticationPrincipal HotelUserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not authenticated"));
        }

        //We have userprincipal already but getting the more updated data is better. 
        User user = userService.findUserById(userPrincipal.getUser().getId());
        
        if (user.getRewardsPoints() < 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Insufficient points. You need 100 points to redeem."));
        }

        try {
            // 1. Generate Stripe Code
            String code = stripeService.createRewardCoupon(user.getId());
            
            // 2. Deduct Points (using your existing addRewardPoints with a negative value)
            userService.addRewardPoints(user.getId(), -100);

            // 3. Return the code and the new balance
            // We verify the math here for the return value: (current - 100)
            return ResponseEntity.ok(Map.of(
                "code", code, 
                "remainingPoints", user.getRewardsPoints() - 100
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error generating reward: " + e.getMessage()));
        }
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validatePromoCode(@PathVariable String code) {
        try {
            // Retrieve the code from Stripe
            var promo = stripeService.retrieveActivePromotionCode(code);

            if (promo != null && promo.getPromotion().getCouponObject().getValid()) {
                var coupon = promo.getPromotion().getCouponObject();
                long amountOffCents = coupon.getAmountOff();
                
                // Return the discount amount in dollars
                return ResponseEntity.ok(java.util.Map.of(
                    "valid", true,
                    "discountAmount", amountOffCents / 100.0
                ));
            }
            return ResponseEntity.badRequest().body("Invalid or expired code");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid code");
        }
    }
}