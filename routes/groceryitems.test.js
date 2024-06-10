const request = require("supertest");
var jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");
const Category = require("../models/grocerycategory");
const GroceryItem = require("../models/groceryitem");

// Needed to "link" grocery item to grocery category it's a part of
const { testCategories } = require('./grocerycategories.test');

describe("/groceryitems", () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);

    let savedCategories;

    // Setting up grocery items
    // Items do not have a grocery category assigned yet 
    const testGroceryItems = [
        { itemName: "Item 1", itemPrice: 1 },
        { itemName: "Item 2", itemPrice: 2 }
    ];

    beforeEach(async () => {
        savedCategories = await Category.insertMany(testCategories);
        savedCategories = savedCategories.map((category) => ({
            ...category.toObject(),
            _id: category._id.toString()
        }));

        // Assign grocery categories (i.e. Category _ids) to grocery items' categoryIds
        testGroceryItems[0].categoryId = savedCategories[0]._id;
        testGroceryItems[1].categoryId = savedCategories[1]._id;
    });

    afterEach(testUtils.clearDB);

    describe("Before user logs on", () => {
        describe("POST /", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).post("/groceryitems").send(testGroceryItems[0]);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .post("/groceryitems")
                    .set("Authorization", "Bearer NONSENSE")
                    .send(testGroceryItems[0]);
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).get("/groceryitems").send(testGroceryItems[0]);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .get("/groceryitems")
                    .set("Authorization", "Bearer NONSENSE")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /:id", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).get("/groceryitems/244").send(testGroceryItems[0]);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .get("/groceryitems/244")
                    .set("Authorization", "Bearer NONSENSE")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
    });

    describe("After user logs on", () => {
        const user2 = {
            email: "user2@mail.com",
            password: "789password",
        };
        const user3 = {
            email: "user3@mail.com",
            password: "101112password",
        };

        let token1;
        let adminToken2;

        beforeEach(async () => {
            await request(server).post("/auth/signup").send(user2);
            const res0 = await request(server).post("/auth/login").send(user2);
            token1 = res0.body.token;
            await request(server).post("/auth/signup").send(user3);
            await User.updateOne(
                { email: user3.email },
                { $push: { roles: "admin" } }
            );
            const res1 = await request(server).post("/auth/login").send(user3);
            adminToken2 = res1.body.token;
        });

        describe.each([testGroceryItems[0], testGroceryItems[1]])("POST / grocery item %#", (groceryItem) => {
            it("should send 403 to normal user and not store grocery item", async () => {
                const res = await request(server)
                    .post("/groceryitems")
                    .set("Authorization", "Bearer " + token1)
                    .send(groceryItem);
                expect(res.statusCode).toEqual(403);
                expect(await GroceryItem.countDocuments()).toEqual(0);
            });
            it("should send 200 to admin user and store grocery item", async () => {
                const res = await request(server)
                    .post("/groceryitems")
                    .set("Authorization", "Bearer " + adminToken2)
                    .send(groceryItem);
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(groceryItem);
                const savedGroceryItem = await GroceryItem.findOne({ _id: res.body._id }).lean();
                // categoryId had to be formatted to string or else a buffer will be returned which will result in tests failing 
                const savedGroceryItemFormatted = { ...savedGroceryItem, categoryId: savedGroceryItem.categoryId.toString() };
                expect(savedGroceryItemFormatted).toMatchObject(groceryItem);
            });
        });

        describe.each([testGroceryItems[0], testGroceryItems[1]])("PUT / grocery item %#", (groceryItem) => {
            let originalGroceryItem;
            beforeEach(async () => {
                const res = await request(server)
                    .post("/groceryitems")
                    .set("Authorization", "Bearer " + adminToken2)
                    .send(groceryItem);
                originalGroceryItem = res.body;
            });
            it("should send 403 to normal user and not update grocery item", async () => {
                const res = await request(server)
                    .put("/groceryitems/" + originalGroceryItem._id)
                    .set("Authorization", "Bearer " + token1)
                    .send({ ...groceryItem, itemPrice: groceryItem.itemPrice + 1 });
                expect(res.statusCode).toEqual(403);
                const newGroceryItem = await GroceryItem.findById(originalGroceryItem._id).lean();
                newGroceryItem._id = newGroceryItem._id.toString();
                newGroceryItem.categoryId = newGroceryItem.categoryId.toString();
                expect(newGroceryItem).toMatchObject(originalGroceryItem);
            });
            it("should send 200 to admin user and update grocery item", async () => {
                const res = await request(server)
                    .put("/groceryitems/" + originalGroceryItem._id)
                    .set("Authorization", "Bearer " + adminToken2)
                    .send({ ...groceryItem, itemPrice: groceryItem.itemPrice + 1 });
                expect(res.statusCode).toEqual(200);
                const newGroceryItem = await GroceryItem.findById(originalGroceryItem._id).lean();
                newGroceryItem._id = newGroceryItem._id.toString();
                newGroceryItem.categoryId = newGroceryItem.categoryId.toString();
                expect(newGroceryItem).toMatchObject({
                    ...originalGroceryItem,
                    itemPrice: originalGroceryItem.itemPrice + 1,
                });
            });
        });

        describe.each([testGroceryItems[0], testGroceryItems[1]])("GET /:id grocery item %#", (groceryItem) => {
            let originalGroceryItem;
            beforeEach(async () => {
                const res = await request(server)
                    .post("/groceryitems")
                    .set("Authorization", "Bearer " + adminToken2)
                    .send(groceryItem);
                originalGroceryItem = res.body;
            });
            it("should send 200 to normal user and return grocery item", async () => {
                const res = await request(server)
                    .get("/groceryitems/" + originalGroceryItem._id)
                    .set("Authorization", "Bearer " + token1)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(originalGroceryItem);
            });
            it("should send 200 to admin user and return grocery item", async () => {
                const res = await request(server)
                    .get("/groceryitems/" + originalGroceryItem._id)
                    .set("Authorization", "Bearer " + adminToken2)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(originalGroceryItem);
            });
        });

        describe("GET /", () => {
            let groceryItems;
            beforeEach(async () => {
                groceryItems = (await GroceryItem.insertMany([testGroceryItems[0], testGroceryItems[1]])).map((i) => i.toJSON());
                groceryItems.forEach((i) => (i._id = i._id.toString()));
                // categoryId had to be formatted to string or else a buffer will be returned which will result in tests failing 
                groceryItems.forEach((i) => (i.categoryId = i.categoryId.toString()));
            });
            it("should send 200 to normal user and return all grocery items", async () => {
                const res = await request(server)
                    .get("/groceryitems/")
                    .set("Authorization", "Bearer " + token1)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(groceryItems);
            });
            it("should send 200 to admin user and return all grocery items", async () => {
                const res = await request(server)
                    .get("/groceryitems/")
                    .set("Authorization", "Bearer " + adminToken2)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject(groceryItems);
            });
        });

        describe.each([testGroceryItems[0], testGroceryItems[1]])("DELETE /:id grocery item %#", (groceryItem) => {
            let originalGroceryItem;
            beforeEach(async () => {
                const res = await request(server)
                    .post("/groceryitems")
                    .set("Authorization", "Bearer " + adminToken2)
                    .send(groceryItem);
                originalGroceryItem = res.body;
            });
            it("should send 403 to normal user and not delete grocery item", async () => {
                const res = await request(server)
                    .delete("/groceryitems/" + originalGroceryItem._id)
                    .set("Authorization", "Bearer " + token1)
                    .send();
                expect(res.statusCode).toEqual(403);
                const updatedGroceryItem = await testUtils.findOne(GroceryItem, { _id: originalGroceryItem._id });
                // categoryId had to be formatted to string or else a buffer will be returned which will result in tests failing 
                const updatedGroceryItemFormatted = { ...updatedGroceryItem, categoryId: updatedGroceryItem.categoryId.toString() };
                expect(updatedGroceryItemFormatted).toEqual(originalGroceryItem);
            });
            it("should send 200 to admin user and delete grocery item", async () => {
                const res = await request(server)
                    .delete("/groceryitems/" + originalGroceryItem._id)
                    .set("Authorization", "Bearer " + adminToken2)
                    .send();
                expect(res.statusCode).toEqual(200);
                const updatedGroceryItem = await testUtils.findOne(GroceryItem, { _id: originalGroceryItem._id });
                expect(updatedGroceryItem).toEqual(null);
            });
        });
    });
}); 