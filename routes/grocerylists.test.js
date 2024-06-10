const request = require("supertest");
var jwt = require("jsonwebtoken");

const server = require("../server");
const testUtils = require("../test-utils");

const User = require("../models/user");
const Category = require("../models/grocerycategory");
const GroceryItem = require("../models/groceryitem");
const GroceryList = require("../models/grocerylist");

// Needed to "link" grocery item to grocery category it's a part of
const { testCategories } = require('./grocerycategories.test');

describe("/grocerylists", () => {
    beforeAll(testUtils.connectDB);
    afterAll(testUtils.stopDB);

    let savedCategories;

    // Setting up grocery items
    // Items do not have a grocery category assigned yet 
    const testGroceryItems = [
        { itemName: "Item 1", itemPrice: 1 },
        { itemName: "Item 2", itemPrice: 2 }
    ];

    let theGroceryItems;

    beforeEach(async () => {
        savedCategories = await Category.insertMany(testCategories);
        savedCategories = savedCategories.map((category) => ({
            ...category.toObject(),
            _id: category._id.toString()
        }));

        // Assign grocery categories (i.e. Category _ids) to grocery items' categoryIds
        testGroceryItems[0].categoryId = savedCategories[0]._id;
        testGroceryItems[1].categoryId = savedCategories[1]._id;

        // Then put test grocery items into GroceryItem db 
        theGroceryItems = (await GroceryItem.insertMany(testGroceryItems)).map((i) => i.toJSON());
    });

    afterEach(testUtils.clearDB);

    describe("Before user logs on", () => {
        describe("POST /", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).post("/grocerylists").send(testGroceryItems[0]);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer NONSENSE")
                    .send(testGroceryItems[0]);
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).get("/grocerylists").send(testGroceryItems[0]);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .get("/grocerylists")
                    .set("Authorization", "Bearer NONSENSE")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
        describe("GET /:id", () => {
            it("should send 401 if no token", async () => {
                const res = await request(server).get("/grocerylists/593").send(testGroceryItems[0]);
                expect(res.statusCode).toEqual(401);
            });
            it("should send 401 if bad token", async () => {
                const res = await request(server)
                    .get("/grocerylists/593")
                    .set("Authorization", "Bearer NONSENSE")
                    .send();
                expect(res.statusCode).toEqual(401);
            });
        });
    });

    describe("After user logs on", () => {
        const user4 = {
            email: "user4@mail.com",
            password: "131415password",
        };
        const user5 = {
            email: "user5@mail.com",
            password: "161718password",
        };

        let token2;
        let adminToken3;

        beforeEach(async () => {
            await request(server).post("/auth/signup").send(user4);
            const res0 = await request(server).post("/auth/login").send(user4);
            token2 = res0.body.token;
            await request(server).post("/auth/signup").send(user5);
            await User.updateOne(
                { email: user5.email },
                { $push: { roles: "admin" } }
            );
            const res1 = await request(server).post("/auth/login").send(user5);
            adminToken3 = res1.body.token;
        });

        describe("POST /", () => {
            it("should send 200 to normal user and create grocery list", async () => {
                const res = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + token2)
                    .send(theGroceryItems.map((i) => i._id));
                expect(res.statusCode).toEqual(200);
                const storedGroceryList = await GroceryList.findOne().lean();
                expect(storedGroceryList).toMatchObject({
                    groceryItems: theGroceryItems.map((i) => i._id),
                    userId: (await User.findOne({ email: user4.email }).lean())._id
                });
            });
            it("should send 200 to admin user and create grocery list", async () => {
                const res = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + adminToken3)
                    .send(theGroceryItems.map((i) => i._id));
                expect(res.statusCode).toEqual(200);
                const storedGroceryList = await GroceryList.findOne().lean();
                expect(storedGroceryList).toMatchObject({
                    groceryItems: theGroceryItems.map((i) => i._id),
                    userId: (await User.findOne({ email: user5.email }).lean())._id
                });
            });
            it("should send 400 with bad grocery item _id", async () => {
                const res = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + adminToken3)
                    .send([theGroceryItems[1], "2u1d7c6vt3gh988t5i3d0g4c"].map((i) => i._id));
                expect(res.statusCode).toEqual(400);
                const storedGroceryList = await GroceryList.findOne().lean();
                expect(storedGroceryList).toBeNull();
            });
        });

        // describe("PUT / grocery list %#", () => {
        //     let groceryList0Id, groceryList1Id;
        //     beforeEach(async () => {
        //         // _id and categoryId had to be formatted to string or else a buffer will be returned which will result in tests failing 
        //         theGroceryItems.forEach((i) => (i._id = i._id.toString()));
        //         theGroceryItems.forEach((i) => (i.categoryId = i.categoryId.toString()));
        //         const res0 = await request(server)
        //             .post("/grocerylists")
        //             .set("Authorization", "Bearer " + token2)
        //             .send([theGroceryItems[0], theGroceryItems[1], theGroceryItems[1]].map((i) => i._id));
        //         groceryList0Id = res0.body._id;
        //         const res1 = await request(server)
        //             .post("/grocerylists")
        //             .set("Authorization", "Bearer " + adminToken3)
        //             .send([theGroceryItems[1]].map((i) => i._id));
        //         groceryList1Id = res1.body._id;
        //     });
        // it("should send 200 to normal user and update grocery list", async () => {
        //     const groceryList0 = await GroceryList.findById(groceryList0Id).lean();
        //     const res = await request(server)
        //         .put("/grocerylists/" + groceryList0Id)
        //         .set("Authorization", "Bearer " + token2)
        //         .send({ ...groceryList0, itemPrice: groceryItem.itemPrice + 1 });
        //     expect(res.statusCode).toEqual(200);
        //     const newGroceryItem = await GroceryItem.findById(originalGroceryItem._id).lean();
        //     newGroceryItem._id = newGroceryItem._id.toString();
        //     newGroceryItem.categoryId = newGroceryItem.categoryId.toString();
        //     expect(newGroceryItem).toMatchObject({
        //         ...originalGroceryItem,
        //         itemPrice: originalGroceryItem.itemPrice + 1,
        //     });
        // });
        // it("should send 200 to admin user and update grocery item", async () => {
        //     const groceryList1 = await GroceryList.findById(groceryList1Id).lean();
        //     const res = await request(server)
        //         .put("/grocerylists/" + groceryList1Id)
        //         .set("Authorization", "Bearer " + adminToken3)
        //         .send({ ...groceryList1, itemPrice: groceryItem.itemPrice + 1 });
        //     expect(res.statusCode).toEqual(200);
        //     const newGroceryItem = await GroceryItem.findById(originalGroceryItem._id).lean();
        //     newGroceryItem._id = newGroceryItem._id.toString();
        //     newGroceryItem.categoryId = newGroceryItem.categoryId.toString();
        //     expect(newGroceryItem).toMatchObject({
        //         ...originalGroceryItem,
        //         itemPrice: originalGroceryItem.itemPrice + 1,
        //     });
        // });
        // });

        describe("GET /:id", () => {
            let groceryList0Id, groceryList1Id;
            beforeEach(async () => {
                // _id and categoryId had to be formatted to string or else a buffer will be returned which will result in tests failing 
                theGroceryItems.forEach((i) => (i._id = i._id.toString()));
                theGroceryItems.forEach((i) => (i.categoryId = i.categoryId.toString()));
                const res0 = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + token2)
                    .send([theGroceryItems[0], theGroceryItems[1], theGroceryItems[1]].map((i) => i._id));
                groceryList0Id = res0.body._id;
                const res1 = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + adminToken3)
                    .send([theGroceryItems[1]].map((i) => i._id));
                groceryList1Id = res1.body._id;
            });
            it("should send 200 to normal user with their grocery list", async () => {
                const res = await request(server)
                    .get("/grocerylists/" + groceryList0Id)
                    .set("Authorization", "Bearer " + token2)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject({
                    groceryItems: [theGroceryItems[0], theGroceryItems[1], theGroceryItems[1]],
                    userId: (await User.findOne({ email: user4.email }))._id.toString()
                });
            });
            it("should send 404 to normal user with someone else's grocery list", async () => {
                const res = await request(server)
                    .get("/grocerylists/" + groceryList1Id)
                    .set("Authorization", "Bearer " + token2)
                    .send();
                expect(res.statusCode).toEqual(404);
            });
            it("should send 200 to admin user with their grocery list", async () => {
                const res = await request(server)
                    .get("/grocerylists/" + groceryList1Id)
                    .set("Authorization", "Bearer " + adminToken3)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject({
                    groceryItems: [theGroceryItems[1]],
                    userId: (await User.findOne({ email: user5.email }))._id.toString()
                });
            });
            it("should send 200 to admin user with someone else's grocery list", async () => {
                const res = await request(server)
                    .get("/grocerylists/" + groceryList0Id)
                    .set("Authorization", "Bearer " + adminToken3)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject({
                    groceryItems: [theGroceryItems[0], theGroceryItems[1], theGroceryItems[1]],
                    userId: (await User.findOne({ email: user4.email }))._id.toString()
                });
            });
        });

        describe("GET /", () => {
            let groceryList0Id, groceryList1Id;
            beforeEach(async () => {
                const res0 = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + token2)
                    .send(theGroceryItems.map((i) => i._id));
                groceryList0Id = res0.body._id;
                const res1 = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + adminToken3)
                    .send([theGroceryItems[1]].map((i) => i._id));
                groceryList1Id = res1.body._id;
            });
            it("should send 200 to normal user with their single grocery list", async () => {
                const res = await request(server)
                    .get("/grocerylists")
                    .set("Authorization", "Bearer " + token2)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([
                    {
                        groceryItems: [theGroceryItems[0]._id.toString(), theGroceryItems[1]._id.toString()],
                        userId: (await User.findOne({ email: user4.email }))._id.toString()
                    }
                ]);
            });
            it("should send 200 to admin user all grocery lists", async () => {
                const res = await request(server)
                    .get("/grocerylists")
                    .set("Authorization", "Bearer " + adminToken3)
                    .send();
                expect(res.statusCode).toEqual(200);
                expect(res.body).toMatchObject([
                    {
                        groceryItems: [theGroceryItems[0]._id.toString(), theGroceryItems[1]._id.toString()],
                        userId: (await User.findOne({ email: user4.email }))._id.toString()
                    },
                    {
                        groceryItems: [theGroceryItems[1]._id.toString()],
                        userId: (await User.findOne({ email: user5.email }))._id.toString()
                    }
                ]);
            });
        });

        describe("DELETE /:id grocery list %#", () => {
            let groceryList0Id, groceryList1Id;
            beforeEach(async () => {
                // _id and categoryId had to be formatted to string or else a buffer will be returned which will result in tests failing 
                theGroceryItems.forEach((i) => (i._id = i._id.toString()));
                theGroceryItems.forEach((i) => (i.categoryId = i.categoryId.toString()));
                const res0 = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + token2)
                    .send([theGroceryItems[0], theGroceryItems[1], theGroceryItems[1]].map((i) => i._id));
                groceryList0Id = res0.body._id;
                const res1 = await request(server)
                    .post("/grocerylists")
                    .set("Authorization", "Bearer " + adminToken3)
                    .send([theGroceryItems[1]].map((i) => i._id));
                groceryList1Id = res1.body._id;
            });
            it("should send 200 to normal user and delete grocery list", async () => {
                const res = await request(server)
                    .delete("/grocerylists/" + groceryList0Id)
                    .set("Authorization", "Bearer " + token2)
                    .send();
                expect(res.statusCode).toEqual(200);
                const updatedGroceryList = await testUtils.findOne(GroceryList, { _id: groceryList0Id });
                expect(updatedGroceryList).toEqual(null);
            });
            it("should send 200 to admin user and delete grocery list", async () => {
                const res = await request(server)
                    .delete("/grocerylists/" + groceryList1Id)
                    .set("Authorization", "Bearer " + adminToken3)
                    .send();
                expect(res.statusCode).toEqual(200);
                const updatedGroceryList = await testUtils.findOne(GroceryList, { _id: groceryList1Id });
                expect(updatedGroceryList).toEqual(null);
            });
        });
    });
}); 