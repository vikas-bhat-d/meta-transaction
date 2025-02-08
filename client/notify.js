function showNotification(data, ms) {
  const textContent = data.textContent;
  const address = data.address;
  const type = data.type;
  console.log(type);

  const notificationContainer = document.querySelector(
    ".notification-container"
  );

  notificationContainer.innerHTML = `
    <div class="text-content">${textContent}</div>
      <div class="data">Addr: ${address}</div>
      <i class="bx bx-check"></i>
  `;

  notificationContainer.classList.remove("error");
  notificationContainer.classList.remove("success");
  notificationContainer.classList.add(type);
  notificationContainer.classList.remove("hide");

  notificationContainer.classList.remove("pop-out");
  notificationContainer.classList.add("pop-in");

  const timeOutId = setTimeout(() => {
    notificationContainer.classList.remove("pop-in");
    notificationContainer.classList.add("pop-out");
    setTimeout(() => {
      notificationContainer.classList.add("hide");
    }, 800);
  }, ms || 2000);

  console.log(timeOutId);
}

function closeOnClick() {
  const notificationContainer = document.querySelector(
    ".notification-container"
  );
  console.log("function called");
  notificationContainer.classList.remove("pop-in");
  notificationContainer.classList.add("pop-out");
  setTimeout(() => {
    notificationContainer.classList.add("hide");
  }, 800);
}
