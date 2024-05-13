# 330-sp24-finalproject-stars5698
# Donna Quach 
Final Project for JavaScript 330B Spring 2024 

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
   - External data sources: Sample data will be entered into MongoDB

4. Clear and direct call-outs of how you will meet the various project requirements.
   - 

6. A timeline for what project components you plan to complete, week by week, for the remainder of the class. 
