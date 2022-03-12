import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable()
export class AuthService {
	private prisma: PrismaService;

	constructor(prisma: PrismaService) {
		this.prisma = prisma;
	}

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

			delete user.hash;

			return user;
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

		// return user
		delete user.hash;
		return user;
	}
}
