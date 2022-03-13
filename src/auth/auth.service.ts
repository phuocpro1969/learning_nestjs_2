import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
	) {}

	async signup(dto: AuthDto) {
		// hash password
		const hash = await argon.hash(dto.password);

		try {
			// save user to database
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					hash,
				},
			});

			return this.sign_token(user.id, user.email);
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					throw new ForbiddenException("Credentials taken");
				}
			}

			throw error;
		}
	}

	async signin(dto: AuthDto) {
		// find user by email
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});

		// throw error if user is not found
		if (!user) throw new ForbiddenException("Credentials incorrect");

		// compare password
		const pwMatches = await argon.verify(user.hash, dto.password);

		// throw error if password is not match

		if (!pwMatches) throw new ForbiddenException("Credentials incorrect");

		return this.sign_token(user.id, user.email);
	}

	async sign_token(
		userId: number,
		email: string,
	): Promise<{ access_token: string }> {
		const payload = {
			sub: userId,
			email,
		};

		const token = await this.jwtService.signAsync(payload, {
			expiresIn: "15m",
			secret: process.env.JWT_SECRET,
		});

		return { access_token: token };
	}
}
