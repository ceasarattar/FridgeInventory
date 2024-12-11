# Fridge Inventory

Mohammad Ayesh, mayes3@uic.edu, GitHub : mayesh3\
Shareek Shaffie, smoah45@uic.edu, GitHub : shar33k\
Ceasar Attar, catta2@uic.edu, GitHub: ceasarattar\
Blaine Edwards, bedwa3@uic.edu, GitHub: blaineedwards45

# Overview
The goal is to build a refrigerator inventory application. The app will allow users to manage their fridge contents through a digital fridge. This fridge is intended to be one large fridge used for something like a restaurant. Since many people access the fridge, users log what they added or removed. Fridge items are stored by category, for example apples would be stored under fruit. Fridge items also allow the user to see who put the item in the fridge. Thus this allows users to be more informed about what food they have thus improving the management of their fridge.

# Data Requirements
**Entities and Relationships**\
*User*\
For each user, we store their user ID, passcode, and name.
This is so that we can identify who has done what in the fridge.
M:M with FridgeItem: A user can add many items, but each FridgeItem is added by one specific user

*FridgeItem*\
For each item in the refrigerator, we store the item name, quantity, and expiration date.
Each item is linked to a user ID, indicating who added or updated it.
M:M with User: one user can add multiple items to the fridge, but each item is added by a single user
M:1 with Category: a category can have multiple items, but each item can only belong to one category.

*Category*\
Each item belongs to a category (e.g., vegetables, dairy, leftovers). The Category entity contains a unique category ID and a name for easy organization and filtering of fridge contents.
1:M with category: One Category can have multiple items, while each item can only belong to one category.

# Application Requirements
*The application should support the following actions.*

**Login**\
Users should be able to login to the application with their passcode so that their actions can be tracked
Managing Fridge Contents:
Users can add items, specify quantities, and set expiration dates.
Users can delete items once they are consumed or removed.

**Viewing and Organizing:**\
Items are displayed in a categorized view to improve discoverability.
Categories such as Dairy, Meat, Vegetable, Fruits.
Users can sort items by different criteria, such as expiration date, quantity and the user who added the item.
Search should allow for combining multiple conditions with "OR" and "AND" to search for an item and the user who added it.




Canva link: https://www.canva.com/design/DAGYCCXNmNM/DgvEPO2nNJKQsuS7t5XB1Q/edit?utm_content=DAGYCCXNmNM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton












.


