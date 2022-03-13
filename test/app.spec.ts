import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from "pactum";
import { AuthDto } from "../src/auth/dto/auth.dto";
import { CreateBookmarkDto, EditBookmarkDto } from "src/bookmark/dto";

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
			it("throw if email is not valid", () => {
				return pactum
					.spec()
					.post("/auth/signup")
					.withBody({
						password: dto.password,
					})
					.expectStatus(400);
			});

			it("throw if password is not valid", () => {
				return pactum
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

			it("should signup", () => {
				return pactum
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
					.expectStatus(200)
					.stores("token", "access_token");
			});
		});
	});

	describe("Users", () => {
		describe("Get Me", () => {
			it("Should get current user", () => {
				return pactum
					.spec()
					.get("/users/me")
					.withHeaders({ Authorization: "Bearer $S{token}" })
					.expectStatus(200);
			});
		});
		describe("Edit User", () => {
			const editUserDto = {
				firstName: "Phan",
				lastName: "Phuoc",
			};
			it("Should edit current user", () => {
				return pactum
					.spec()
					.patch("/users")
					.withHeaders({ Authorization: "Bearer $S{token}" })
					.withBody(editUserDto)
					.expectStatus(200)
					.expectBodyContains(editUserDto.firstName)
					.expectBodyContains(editUserDto.lastName);
			});
		});
	});

	describe("Bookmarks", () => {
		describe("Get empty bookmarks", () => {
			it("should get bookmarks", () => {
				return pactum
					.spec()
					.get("/bookmarks")
					.withHeaders({
						Authorization: "Bearer $S{token}",
					})
					.expectStatus(200)
					.expectBody([]);
			});
		});

		describe("Create bookmark", () => {
			const dto: CreateBookmarkDto = {
				title: "First Bookmark",
				link: "https://www.youtube.com/watch?v=d6WC5n9G_sM",
			};
			it("should create bookmark", () => {
				return pactum
					.spec()
					.post("/bookmarks")
					.withHeaders({
						Authorization: "Bearer $S{token}",
					})
					.withBody(dto)
					.expectStatus(201)
					.stores("bookmarkId", "id");
			});
		});

		describe("Get bookmarks", () => {
			it("should get bookmarks", () => {
				return pactum
					.spec()
					.get("/bookmarks")
					.withHeaders({
						Authorization: "Bearer $S{token}",
					})
					.expectStatus(200)
					.expectJsonLength(1);
			});
		});

		describe("Get bookmark by id", () => {
			it("should get bookmark by id", () => {
				return pactum
					.spec()
					.get("/bookmarks/{id}")
					.withPathParams("id", "$S{bookmarkId}")
					.withHeaders({
						Authorization: "Bearer $S{token}",
					})
					.expectStatus(200)
					.expectBodyContains("$S{bookmarkId}");
			});
		});

		describe("Edit bookmark by id", () => {
			const dto: EditBookmarkDto = {
				title: "Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)",
				description:
					"Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.",
			};

			it("should edit bookmark", () => {
				return pactum
					.spec()
					.patch("/bookmarks/{id}")
					.withPathParams("id", "$S{bookmarkId}")
					.withHeaders({
						Authorization: "Bearer $S{token}",
					})
					.withBody(dto)
					.expectStatus(200)
					.expectBodyContains(dto.title)
					.expectBodyContains(dto.description);
			});
		});

		describe("Delete bookmark by id", () => {
			it("should delete bookmark", () => {
				return pactum
					.spec()
					.delete("/bookmarks/{id}")
					.withPathParams("id", "$S{bookmarkId}")
					.withHeaders({
						Authorization: "Bearer $S{token}",
					})
					.expectStatus(204);
			});

			it("should get empty bookmarks", () => {
				return pactum
					.spec()
					.get("/bookmarks")
					.withHeaders({
						Authorization: "Bearer $S{token}",
					})
					.expectStatus(200)
					.expectJsonLength(0);
			});
		});
	});
});
