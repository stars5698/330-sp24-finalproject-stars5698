# 330-sp24-finalproject-stars5698
# Donna Quach 
Final Project for JavaScript 330B Spring 2024 

***SELF-EVALUATION: June 9, 2024***
I thought I did well when it came to planning out how I would approach this project. I found it helpful that I was able to lay out what kind of models, daos, and routes I would create in great detail. It kept me organized because it helped me to remember what I need to include in my project to meet the requirements. I learned a lot while working on this assignment. There were bugs that I have never encountered before in previous homework assignments, so I had the opportunity to learn what those bugs meant and learned how to resolve them in order to make my tests pass. In addition, I liked using Postman to validate that my routes are actually working properly visually. I learned how to use Postman in conjunction with the tests to see if my program was written in a way that it does what it is supposed to do. It helped to see how the data was being passed through the program in or out. I think I could have improved on what kind of data was displayed. One of my models includes showing the type of grocery category, however I only had time to include the categoryId rather than the category name. But, doing so would require some more logic that would extract the category name, due to time constraints I was not able to get that part completed. Having the category name display on the grocery list itself would have made it more apparent to the user what kind of items they have included in their grocery list. A challenge on this final project was writing tests before I writing the code and learning what the tests do specifically line-by-line. It took me some time to finally understand and/or get used to writing the lines of code. 

***UPDATE: May 26, 2024***
What was completed:
1) Created package.json and package-lock.json files in root folder 
2) Created .gitignore file in folder 
3) Made sure Node.js was installed 
4) Installed dependencies (bcrypt, express, jsonwebtoken, mongoose)
5) Installed dev dependencies (jest-mongodb preset, jest, supertest)
6) Installed npm ci (clean install)
7) Created server.js file in root folder 
8) Created index.js file in root folder which contains mongoose connection to Grocery-Shopping db
9) Created node.js.yml file within .github/workflows folder 
10) Created empty folders that will hold dao and route files 
11) Set up models for project (user, grocery category, grocery item, grocery list)
 
What remains: 
1) Writing tests for all route files (user, grocery category, grocery item, grocery list)
2) Writing code for all route files (user, grocery category, grocery item, grocery list)
3) Writing code for all dao files (user, grocery category, grocery item, grocery list)
4) Making sure that requests work in Postman 

***END OF UPDATE***


Proposal and Task Breakdown
Your Final Project proposal is due. You should submit a link to a GitHub project that will house your submission. The project README should contain your project proposal. Your proposal should include:

1. A description of the scenario your project is operating in.
   - The user is a customer for a grocery store. Before they make their trip to the store, they need to make sure that they know what items they plan to purchase. 

2. A description of what problem your project seeks to solve.
   - People are busy nowadays, and that includes the fact that they are running errands. This API will allow users to maintain a grocery shopping list where they list items they plan to purchase whether it is for them or for their entire family. This will help the user stay organized and not forget what they need. 

3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.
   - User models:
     - User: _id, first name, last name, email, password hash 
     - Grocery Category: _id, category name, category description 
     - Grocery Item: _id, item name, category id or description (by referencing Grocery Category model), price
     - Grocery List: _id, grocery item name (by referencing Grocery Item model), item price (by referencing Grocery Item model), userId (i.e. who added the item by referencing User model) 
   - Daos:
     - User: Create a user, get a user (based on id), update a user (based on id), delete a user (based on id), get all users
     - Grocery Category: Create a category, get a category (based on id), update a category (based on id), delete a category (based on id), get all grocery categories
     - Grocery Item: Create a grocery item, get a grocery item (based on item id), update a category item (based on id), delete a category (based on id), get all grocery items that are on the list for a user
     - Grocery List (initially an empty array): Add grocery item to list (based on item id and user id?), get all grocery items from list (based on user id?), Remove grocery item from list (based on item id and user id?) 
   - Routes:
     - Authentication and Authorization: Middleware that checks if we have a valid user with their token, etc. 
     - User: POST ("/") to create a user, GET ("/") get all users, GET ("/:id") get a user based on their id, PUT ("/password") update a user's password, DELETE ("/:id") delete a user based on their id  
     - Grocery Category: POST ("/") to create a grocery category, GET ("/") get all grocery categories, GET ("/:id") get a grocery category based on its id, PUT ("/:id") update a grocery category, DELETE ("/:id") delete a grocery based on its id  
     - Grocery Item: POST ("/") to create a grocery item, GET ("/") get all grocery items in store, GET ("/:id") get a grocery item based on its id, PUT ("/:id") update a grocery item, DELETE ("/:id") delete a grocery item based on its id
     - Grocery List: POST ("/") to create a grocery list item, GET ("/") get all grocery list items, GET ("/:id") get a grocery list item based on its id, PUT ("/:id") update a grocery list item, DELETE ("/:id") delete a grocery list item based on its id  
   - Index.js files: One for the routes folder that will list what routes the program will use and one for the main folder for where it will connect to, etc.
   - Test files: One for user, grocery category, grocery item, and grocery list
   - Other files: .gitignore, install any dependencies (Node.js, npm, jest test, etc.) to make project executable 
   - External data sources: Sample data will be entered into MongoDB

4. Clear and direct call-outs of how you will meet the various project requirements.
   - API will have middleware that checks if the user is a valid user via middleware within the user files.
   - There will be at a minimum 2 sets of CRUD routes because we have to create a set of CRUD routes for each of the models represented within this project (which amounts to 4 here.)
   - Indexes and/or unique indexes might be used to quickly find a grocery item and/or a user
   - Text search, aggregations, and lookups can be applied to the daos for finding grocery items that are part of a grocery category and/or it can also be applied to what is currently on the user's grocery shopping list.
   - Tests will be implemented for each of the different components (user, grocery category, grocery item, grocery list.)
     
5. A timeline for what project components you plan to complete, week by week, for the remainder of the class.
   - Week 7: Install any dependencies, create folder structure of project (models, daos, routes, etc.), create blank files for the models, daos, routes, etc. and place them into respective folders, fill out index.js file and place them in main folder noting what it will be connected to, write out user models (making sure that the data types and any indexes needed are noted properly), write down an "example" of how a user/grocery category/grocery item/grocery list would be returned to the user, choose authentication method (UUID vs. JWT), write middleware and determine which files it will be used in  
   - Week 8: Write daos and routes for all components, complete index.js file for routes folder, start writing Jest tests for components and test them
   - Week 9: Set up MongoDB to hold the data, finish writing Jest tests and continue testing for them, try it out in Postman or something similar, create PowerPoint slide deck 
   - Week 10: Hopefully 90% of the project will be functional in time for the class presentation, wrap up project if needed and submit 
