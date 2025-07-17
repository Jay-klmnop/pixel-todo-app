document.addEventListener('DOMContentLoaded', () => {

    const namingScreen = document.querySelector('#naming-screen');
    const nameInput = document.querySelector('#name-input');
    const startButton = document.querySelector('#start-button');
    const mainApp = document.querySelector('main');
    const roomOwnerName = document.querySelector('#room-owner-name');
    const todoInput = document.querySelector('#todoInput');
    const addButton = document.querySelector('#addButton');
    const todoList = document.querySelector('#todoList');
    const hideButton = document.querySelector('#hideButton');
    const showButton = document.querySelector('#showButton');
    const completedCountSpan = document.querySelector('#completedCount');
    const totalCountSpan = document.querySelector('#totalCount');
    const characterRoom = document.querySelector('#character-room');

    const a_library = {
        cat: {
            name: 'Cat',
            states: {
                spinning: 'assets/lofi/cat_purple_oiia.gif',
                sitting: 'assets/lofi/cat_purple_l.gif',
                dancing: 'assets/lofi/cat_final_crop.gif'
            }
        },
        background: { name: 'Background', path: 'assets/lofi/background.png' },
        window: { name: 'Sunset Window', path: 'assets/lofi/window_half.png' },
        curtain: { name: 'Curtain', path: 'assets/lofi/curtain.gif' },
        computer: { name: 'Computer', path: 'assets/lofi/com_con-3.png' },
        coffee_mug: { name: 'Coffee Mug', path: 'assets/lofi/coffee_cup-crop.gif' },
        memo: { name: 'Sticky Notes', path: 'assets/lofi/memo.png' },
        mp3: { name: 'MP3 Player' },
    };

    let todos = [];
    const rewardList = ['background', 'window', 'curtain', 'computer', 'coffee_mug', 'memo', 'mp3'];
    let rewardIndex = 0;
    let lastRewardCount = 0;
    let hideCompleted = false;

    function saveTodos() {
        localStorage.setItem('my-todos', JSON.stringify(todos));
    }

    function loadTodos() {
        const savedData = localStorage.getItem('my-todos');
        if (savedData) {
            todos = JSON.parse(savedData);
        }
    }

    function renderTodos() {
        todoList.innerHTML = '';
        todos.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
        const todosToRender = todos.filter(todo => !(hideCompleted && todo.completed));
        todosToRender.forEach((todo, index) => {
            const listItem = document.createElement('li');
            const textSpan = document.createElement('span');
            textSpan.textContent = todo.text;
            listItem.appendChild(textSpan);
            if (todo.completed) {
                listItem.classList.add('completed');
            }
            const originalIndex = todos.findIndex(t => t === todo);
            listItem.dataset.index = originalIndex;
            listItem.addEventListener('click', toggleTodo);
            todoList.appendChild(listItem);
        });
        updateCounter();
        checkAndGiveReward();
    }

    function displayItem(itemName) {
        const itemData = a_library[itemName];
        if (!itemData) return;
        const imgElement = document.createElement('img');
        imgElement.id = itemName;
        imgElement.alt = itemData.name;

        if (itemName === 'background') {
            const itemData = a_library[itemName];
            characterRoom.style.backgroundImage = `url(${itemData.path})`;
            return;
        }

        if (itemName === 'cat') {
            imgElement.src = a_library.cat.states.spinning;
        } else {
            imgElement.src = itemData.path;
        }

        if (itemName === 'cat') {
            imgElement.classList.add('character-item');
        } else {
            imgElement.classList.add('reward-item');
        }
        characterRoom.appendChild(imgElement);
    }

    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            todos.push({ text: text, completed: false });
            saveTodos();
            renderTodos();
            todoInput.value = '';
        } else {
            alert('Please enter a to-do.');
        }
    }

    function toggleTodo(event) {
        const index = event.currentTarget.dataset.index;
        if (todos[index]) {
            todos[index].completed = !todos[index].completed;
            saveTodos();
            renderTodos();
        }
    }

    function updateCounter() {
        const totalItems = todos.length;
        const completedItems = todos.filter(todo => todo.completed).length;
        totalCountSpan.textContent = `Total: ${totalItems}`;
        completedCountSpan.textContent = `Completed: ${completedItems}`;
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 2500);
    }

    function checkAndGiveReward() {
        const completedCount = todos.filter(todo => todo.completed).length;
        if (completedCount > 0 && completedCount % 5 === 0 && completedCount > lastRewardCount) {
            if (rewardIndex < rewardList.length) {
                const itemToGive = rewardList[rewardIndex];
                if (!document.querySelector(`#${itemToGive}`)) {
                    if (itemToGive === 'mp3') {
                        const catImage = document.querySelector('#cat');
                        if (catImage) {
                            catImage.src = a_library.cat.states.dancing;
                            catImage.classList.add('is-dancing');
                        }
                        showNotification("Congratulations! You've completed the room! Look at them go!");
                    } else {
                        displayItem(itemToGive);
                        showNotification(`You've earned a ${a_library[itemToGive].name}! Great job!`);
                    }
                    rewardIndex++;
                    lastRewardCount = completedCount;
                    const catImage = document.querySelector('#cat');
                    if (catImage && itemToGive === 'background') {
                        catImage.src = a_library.cat.states.sitting;
                    }
                }
            }
        }
    }

    function startApp(catName) {
        roomOwnerName.textContent = `@${catName}'s Room`;
        namingScreen.style.display = 'none';
        mainApp.style.display = 'block';
        addButton.addEventListener('click', addTodo);
        todoInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addTodo();
            }
        });
        hideButton.addEventListener('click', () => {
            hideCompleted = true;
            renderTodos();
        });
        showButton.addEventListener('click', () => {
            hideCompleted = false;
            renderTodos();
        });

        displayItem('cat');
        loadTodos();
        renderTodos();
    }

    const savedCatName = localStorage.getItem('catName');
    if (savedCatName) {
        startApp(savedCatName);
    } else {
        function handleNameSubmit() {
            const catName = nameInput.value.trim();
            if (catName) {
                localStorage.setItem('catName', catName);
                startApp(catName);
            } else {
                alert("Please give your friend a name!");
            }
        }
    }

    startButton.addEventListener('click', handleNameSubmit);
    nameInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleNameSubmit();
        }
    })
});
