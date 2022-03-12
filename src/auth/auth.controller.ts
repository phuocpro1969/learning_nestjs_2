import { Controller, Post } from "@nestjs/common";
// import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	// private authService;
	// constructor(authService: AuthService) {
	// 	this.authService = authService;
	// }

	@Post("signup")
	signup() {
		//return this.authService.signup();
		return "1";
	}

	@Post("signin")
	signin() {
		// return this.authService.signin();\
		return "2";
	}
}
