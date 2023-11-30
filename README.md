# api-daily-diet

This API is designed to support meal management (all meals a user eats throughout their day and whether they were on or off a diet).

## HTTP requests overview

- GET /meal: Retrieves all the meals for a user; 
- GET /meal/:id: Gets a specific meal. Returns **500** when :id is not an UUID; **404** when there's no meal with :id; **200** if the data is found;
- GET /meal/summary: Returns **200** and an object with mealsOffDiet, mealsOnDiet, allMeals and streak (all set to 0 if there are no meals);
- DELETE /meal/:id: deletes the meal with :id. It returns **200** when the meal is found and deleted; **404** if it's not found and **500** if :id is not an uuid;
- POST /meal: creates a meal based on the request body with {name, description, mealAt, onDiet}. It returns **201**.
