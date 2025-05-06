// // Add food item to the list on "Add" button click
// document.getElementById("addFoodItem").addEventListener("click", (e) => {
//   e.preventDefault();
//   // Get form values
//   const food = document.getElementById("foodInput").value;
//   const calories = document.getElementById("calorieInput").value;
//   const quantity = document.getElementById("quantityInput").value;

//   // Create a new list item
//   const listItem = document.createElement("li");
//   listItem.classList.add("foodItem", "py-3");

//   // Create spans for food and calories
//   const details1 = document.createElement("span");
//   details1.classList.add("px-3");
//   details1.textContent = `${quantity}x ${food}`;

//   const details2 = document.createElement("div");
//   const calroiesValue = document.createElement("span");

//   // create img element with src=/images/trash.png
//   const deleteDivContainer = document.createElement("div");
//   deleteDivContainer.classList.add("deleteItem", "px-3");
//   const deleteIcon = document.createElement("img");
//   deleteIcon.src = "/images/trash.png";
//   deleteIcon.alt = "delete";

//   details2.classList.add("d-flex", "h-100", "align-items-center");
//   calroiesValue.classList.add("px-3", "foodItemCalorie");
//   calroiesValue.textContent = `${calories}`;

//   // Append the spans to list item and
//   // and append list item to food list
//   listItem.appendChild(details1);
//   listItem.appendChild(details2);
//   document.getElementById("foodList").appendChild(listItem);

//   // Clear the input fields
//   document.getElementById("foodInput").value = "";
//   document.getElementById("calorieInput").value = "";
//   document.getElementById("quantityInput").value = "";

//   // Send data to server
//   //  fetch("/api/food", {
//   //     method: "POST",
//   //     headers: { "Content-Type": "application/json" },
//   //     body: JSON.stringify({ food, calories, quantity }),
//   //   })
//   //     .then((response) => response.json())
//   //     .then((data) => console.log("Success:", data))
//   //     .catch((error) => console.error("Error:", error));
// });

// Add food item to the list on "Add" button click
document.getElementById("addFoodItem").addEventListener("click", (e) => {
  e.preventDefault();
  // Get form values
  const food = document.getElementById("foodInput").value;
  const calories = document.getElementById("calorieInput").value;
  const quantity = document.getElementById("quantityInput").value;

  // Clear the input fields
  document.getElementById("foodInput").value = "";
  document.getElementById("calorieInput").value = "";
  document.getElementById("quantityInput").value = "";

  // Send data to server
  //  fetch("/api/food", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ food, calories, quantity }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => console.log("Success:", data))
  //     .catch((error) => console.error("Error:", error));
});

console.log("diary js loaded");

// Delete food item from list
document.addEventListener("DOMContentLoaded", () => {
  // For debugging - shows all elements in list - delete me when finished
  // const foodTrashElements = document.querySelectorAll(".deleteItem");
  // console.log(foodTrashElements);

  document.querySelectorAll(".deleteItem").forEach((trashIcon) => {
    console.log("selected all icons");
    trashIcon.addEventListener("click", (e) => {
      e.preventDefault();

      const foodItem = e.target.closest(".foodItem");
      if (foodItem) {
        foodItem.remove();
      }
    });
  });
});
