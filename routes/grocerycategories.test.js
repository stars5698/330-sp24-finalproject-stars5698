const request = require("supertest");
var jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");
const Category = require("../models/grocerycategory");

const category0 = { categoryName: 'first category', categoryDescription: 'grocery category 1' };
const category1 = { categoryName: 'second category', categoryDescription: 'grocery category 2' };

// Needed for groceryitems test file
const testCategories = [
    { categoryName: 'first category', categoryDescription: 'grocery category 1' },
    { categoryName: 'second category', categoryDescription: 'grocery category 2' }
];

module.exports = { testCategories };

describe("/grocerycategories", () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);

    afterEach(testUtils.clearDB);

    describe("Before user logs on", () => {
        describe("POST /", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).post("/grocerycategories").send(category0);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .post("/grocerycategories")
                    .set("Authorization", "Bearer NONSENSE")
                    .send(category0);
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).get("/grocerycategories").send(category0);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .get("/grocerycategories")
                    .set("Authorization", "Bearer NONSENSE")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /:id", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).get("/grocerycategories/111").send(category0);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .get("/grocerycategories/222")
                    .set("Authorization", "Bearer NONSENSE")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
    });

    describe("After user logs on", () => {
        const user0 = {
            email: "user0@mail.com",
            password: "abciseasyas123password",
        };
        const user1 = {
            email: "user1@mail.com",
            password: "456pickupstickspassword",
        };

        let token0;
        let adminToken;

        beforeEach(async () => {
            await request(server).post("/auth/signup").send(user0);
            const res0 = await request(server).post("/auth/login").send(user0);
            token0 = res0.body.token;
            await request(server).post("/auth/signup").send(user1);
            await User.updateOne(
                { email: user1.email },
                { $push: { roles: "admin" } }
            );
            const res1 = await request(server).post("/auth/login").send(user1);
            adminToken = res1.body.token;
        });

        describe.each([category0, category1])("POST / category %#", (category) => {
            it("should send 403 to normal user and not store grocery category", async () => {
                const res = await request(server)
                    .post("/grocerycategories")
                    .set("Authorization", "Bearer " + token0)
                    .send(category);
                expect(res.statusCode).toEqual(403);
                expect(await Category.countDocuments()).toEqual(0);
            });
            it("should send 200 to admin user and store grocery category", async () => {
                const res = await request(server)
                    .post("/grocerycategories")
                    .set("Authorization", "Bearer " + adminToken)
                    .send(category);
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(category);
                const savedCategory = await Category.findOne({ _id: res.body._id }).lean();
                expect(savedCategory).toMatchObject(category);
            });
        });

        describe.each([category0, category1])("PUT / category %#", (category) => {
            let originalCategory;
            beforeEach(async () => {
                const res = await request(server)
                    .post("/grocerycategories")
                    .set("Authorization", "Bearer " + adminToken)
                    .send(category);
                originalCategory = res.body;
            });
            it("should send 403 to normal user and not update category", async () => {
                const res = await request(server)
                    .put("/grocerycategories/" + originalCategory._id)
                    .set("Authorization", "Bearer " + token0)
                    .send({ ...category, categoryDescription: category.categoryDescription + "more details" });
                expect(res.statusCode).toEqual(403);
                const newCategory = await Category.findById(originalCategory._id).lean();
                newCategory._id = newCategory._id.toString();
                expect(newCategory).toMatchObject(originalCategory);
            });
            it("should send 200 to admin user and update category", async () => {
                const res = await request(server)
                    .put("/grocerycategories/" + originalCategory._id)
                    .set("Authorization", "Bearer " + adminToken)
                    .send({ ...category, categoryDescription: category.categoryDescription + "more details" });
                expect(res.statusCode).toEqual(200);
                const newCategory = await Category.findById(originalCategory._id).lean();
                newCategory._id = newCategory._id.toString();
                expect(newCategory).toMatchObject({
                    ...originalCategory,
                    categoryDescription: category.categoryDescription + "more details"
                });
            });
        });

        describe.each([category0, category1])("GET /:id category %#", (category) => {
            let originalCategory;
            beforeEach(async () => {
                const res = await request(server)
                    .post("/grocerycategories")
                    .set("Authorization", "Bearer " + adminToken)
                    .send(category);
                originalCategory = res.body;
            });
            it("should send 200 to normal user and return category", async () => {
                const res = await request(server)
                    .get("/grocerycategories/" + originalCategory._id)
                    .set("Authorization", "Bearer " + token0)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(originalCategory);
            });
            it("should send 200 to admin user and return category", async () => {
                const res = await request(server)
                    .get("/grocerycategories/" + originalCategory._id)
                    .set("Authorization", "Bearer " + adminToken)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(originalCategory);
            });
        });

        describe("GET /", () => {
            let categories;
            beforeEach(async () => {
                categories = (await Category.insertMany([category0, category1])).map((i) => i.toJSON());
                categories.forEach((i) => (i._id = i._id.toString()));
            });
            it("should send 200 to normal user and return all grocery categories", async () => {
                const res = await request(server)
                    .get("/grocerycategories/")
                    .set("Authorization", "Bearer " + token0)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(categories);
            });
            it("should send 200 to admin user and return all grocery categories", async () => {
                const res = await request(server)
                    .get("/grocerycategories/")
                    .set("Authorization", "Bearer " + adminToken)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(categories);
            });
        });
    });
}); 