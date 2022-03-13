import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto/auth.dto";

describe("AppController (e2e)", () => {
	let app: INestApplication;
	let prisma: PrismaService;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
			}),
		);

		await app.init();
		await app.listen(3344);

		prisma = app.get(PrismaService);
		await prisma.cleanDB();

		pactum.request.setBaseUrl("http://localhost:3344");
	});

	afterAll(async () => {
		await app.close();
	});

	describe("Auth", () => {
		const dto: AuthDto = {
			email: "phuoc@admin.com",
			password: "admin",
		};

		describe("Signup", () => {
			it("throw if email is not valid", async () => {
				return await pactum
					.spec()
					.post("/auth/signup")
					.withBody({
						password: dto.password,
					})
					.expectStatus(400);
			});

			it("throw if password is not valid", async () => {
				return await pactum
					.spec()
					.post("/auth/signup")
					.withBody({
						email: dto.email,
					})
					.expectStatus(400);
			});

			it("throw if body is empty", () => {
				return pactum.spec().post("/auth/signup").expectStatus(400);
			});

			it("should signup", async () => {
				return await pactum
					.spec()
					.post("/auth/signup")
					.withBody(dto)
					.expectStatus(201);
			});
		});

		describe("Signin", () => {
			it("throw if email is not valid", () => {
				return pactum
					.spec()
					.post("/auth/signin")
					.withBody({
						password: dto.password,
					})
					.expectStatus(400);
			});
			it("throw if password is not valid", () => {
				return pactum
					.spec()
					.post("/auth/signin")
					.withBody({
						email: dto.email,
					})
					.expectStatus(400);
			});
			it("throw if body is empty", () => {
				return pactum.spec().post("/auth/signin").expectStatus(400);
			});
			it("should signin", () => {
				return pactum
					.spec()
					.post("/auth/signin")
					.withBody(dto)
					.expectStatus(200);
			});
		});
	});

	describe("Users", () => {
		describe("Get Me", () => {
			it.todo("should signup");
		});

		describe("Edit User", () => {
			it.todo("should signup");
		});
	});

	describe("Bookmarks", () => {
		describe("Create Bookmarks", () => {
			it.todo("should signup");
		});

		describe("Get Bookmarks", () => {
			it.todo("should signup");
		});

		describe("Get Bookmarks by Id", () => {
			it.todo("should signup");
		});

		describe("Update Bookmarks", () => {
			it.todo("should signup");
		});

		describe("Detele Bookmarks", () => {
			it.todo("should signup");
		});
	});
});
