// Add food item to the list on "Add" button click
document.getElementById("addFoodItem").addEventListener("click", (e) => {
  // e.preventDefault();
  // Get form values
  const foodAmount = document.getElementById("quantityInput").value;
  const foodItem = document.getElementById("foodInput").value;
  const foodCalories = document.getElementById("calorieInput").value;

  // Create a new list item
  const listItem = document.createElement("li");
  listItem.classList.add("foodItem");

  // Create spans for food and calories
  const details1 = document.createElement("span");
  details1.classList.add("px-3");
  details1.textContent = `${foodAmount}x ${foodItem}`;

  const details2 = document.createElement("div");
  const calroiesValue = document.createElement("span");
  calroiesValue.classList.add("px-3", "foodItemCalorie");
  calroiesValue.textContent = `${foodCalories}`;
  details2.appendChild(calroiesValue);

  // create img element with src=/images/trash.png
  const deleteDivContainer = document.createElement("div");
  deleteDivContainer.classList.add("deleteItem", "px-3");
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "/images/trash.png";
  deleteIcon.alt = "delete";
  deleteDivContainer.appendChild(deleteIcon);
  details2.appendChild(deleteDivContainer);

  details2.classList.add("d-flex", "h-100", "align-items-center");

  // Append the spans to list item and
  // and append list item to food list
  listItem.appendChild(details1);
  listItem.appendChild(details2);
  document.getElementById("foodList").appendChild(listItem);

  // Attach the delete listener to the newly create trash icon for this list item
  attachDelete(deleteDivContainer);

  // Make Fetch call to /diaryAddFood to add food to DB
  fetch("/api/diary/addFoodToDiary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ foodItem, foodCalories, foodAmount }),
  })
    .then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return (window.location.href = "/diary");
    })
    .then((data) => {
      console.log("What is data: ", data);
      console.log("Food item added successfully:", data);
      // Clear the input fields
      document.getElementById("foodInput").value = "";
      document.getElementById("calorieInput").value = "";
      document.getElementById("quantityInput").value = "";
    })
    .catch((error) => {
      console.error("Error adding food item:", error);
      alert("Error adding food item. Please try again later.");
    });
});

// Delete food item from list
document.addEventListener("DOMContentLoaded", () => {
  // For debugging - shows all elements in list - delete me when finished
  // const foodTrashElements = document.querySelectorAll(".deleteItem");
  // console.log(foodTrashElements);

  document.querySelectorAll(".deleteItem").forEach((trashIcon) => {
    attachDelete(trashIcon);
  });
});

function attachDelete(element) {
  element.addEventListener("click", (e) => {
    e.preventDefault();

    const foodItem = e.target.closest(".foodItem");
    if (foodItem) {
      // get food item id
      const foodItemId = foodItem.getAttribute("data-id");
      // Delete the food item from the database
      fetch("/api/diary/deleteFoodFromDiary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodItemId,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Food item deleted successfully:", data);
        })
        .catch((error) => {
          console.error("Error deleting food item:", error);
          alert("Error deleting food item. Please try again later.");
        });

      // remove from the DOM
      foodItem.remove();
    }
  });
}
