package com.fintrack.backend.dto.Response;

import com.fintrack.backend.enums.Role;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {

    public String accessToken;

    public String userId;

    public String username;

    public Role role;
}
