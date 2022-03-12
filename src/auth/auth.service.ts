import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";

@Injectable()
export class AuthService {
	private prisma: PrismaService;

	constructor(prisma: PrismaService) {
		this.prisma = prisma;
	}

	async signup(dto: AuthDto) {
		// hash password
		const hash = await argon.hash(dto.password);

		// save user to database
		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				hash,
			},
		});

		return user;
	}

	signin() {
		return "sign in";
	}
}
