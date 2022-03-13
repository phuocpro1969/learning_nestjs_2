import { Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { JwtGaurd } from "../auth/guard";
import { GetUser } from "../auth/decorator/get-user.decorator";
import { User } from "@prisma/client";

@UseGuards(JwtGaurd)
@Controller("users")
export class UserController {
	@Get("me")
	getMe(@GetUser() user: User) {
		return user;
	}

	@Patch("me")
	editUser() {
		return "ok";
	}
}
