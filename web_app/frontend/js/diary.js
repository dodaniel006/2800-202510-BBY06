// Add food item to the list on "Add" button click
document.getElementById("addFoodItem").addEventListener("click", (e) => {
  // e.preventDefault();
  // Get form values
  const foodAmount = document.getElementById("quantityInput").value || 1;
  const foodItem = document.getElementById("foodInput").value;
  const foodCalories = document.getElementById("calorieInput").value || 0;

  // Make Fetch call to /diaryAddFood to add food to DB
  foodItem !== "" ? addFoodToDiary(foodItem, foodCalories, foodAmount) : null;
});

function addFoodToDiary(foodItem, foodCalories, foodAmount) {
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
      // return (window.location.href = "/diary");
    })
    .catch((error) => {
      console.error("Error adding food item:", error);
      alert("Error adding food item. Please try again later.");
    });
}

// add edit and delete listeners for each food item in list
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".deleteItem").forEach((trashIcon) => {
    attachDelete(trashIcon);
  });

  document.querySelectorAll(".editItem").forEach((editIcon) => {
    attachEditFoodItem(editIcon);
  });
});

function attachDelete(element) {
  element.addEventListener("click", (e) => {
    e.preventDefault();

    const foodItem = e.target.closest("tr.foodItem");
    if (foodItem) {
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
          // reduce the total calories tally
          const totalCalories = document.getElementById("totalCalories");
          const currentCalories = parseInt(totalCalories.innerText);
          // get food amount
          const foodAmount = parseInt(
            foodItem.querySelector(".foodAmount").innerText
          );
          const foodCalories = parseInt(
            foodItem.querySelector(".foodCalories").innerText
          );
          totalCalories.innerText = currentCalories - foodCalories * foodAmount;
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

async function attachEditFoodItem(element) {
  element.addEventListener("click", (e) => {
    const foodItem = e.target.closest("tr.foodItem");

    // Target the edit modal input fields
    const editName = document.getElementById("editFoodItem");
    const editAmount = document.getElementById("editAmountInput");
    const editCalorie = document.getElementById("editCalorieInput");

    if (foodItem) {
      const foodItemId = foodItem.getAttribute("data-id");
      const foodName = foodItem.querySelector(".foodName").innerText;
      const foodCalories = foodItem.querySelector(".foodCalories").innerText;
      const foodAmount = foodItem.querySelector(".foodAmount").innerText;

      editName.value = foodName;
      editAmount.value = foodAmount;
      editCalorie.value = foodCalories;

      const saveButton = document.getElementById("saveEdit");
      saveButton.addEventListener("click", (e) => {
        editFoodItem(
          foodItemId,
          editName.value,
          editAmount.value,
          editCalorie.value
        );
      });
    }
  });
}

async function editFoodItem(foodItemId, name, amount, calorie) {
  const response = await fetch("/api/diary/editFood", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      foodItemId,
      name,
      calorie,
      amount,
    }),
  });

  if (!response.ok) {
    console.error("Error editing food item:", response.statusText);
  } else {
    return (window.location.href = "/diary");
  }
}
