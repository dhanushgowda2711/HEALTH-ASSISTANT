document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');
    const signUpButton = document.getElementById('sign-up-button');
    const signInButton = document.getElementById('sign-in-button');
    const signUpForm = document.getElementById('sign-up-form');
    const signInForm = document.getElementById('sign-in-form');

    // Simulate splash screen delay
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
    }, 3000);

    // Navigation events
    signUpButton.addEventListener('click', () => {
        signUpForm.classList.remove('hidden');
        signInForm.classList.add('hidden');
    });

    signInButton.addEventListener('click', () => {
        signInForm.classList.remove('hidden');
        signUpForm.classList.add('hidden');
    });

    // Retrieve users from localStorage or initialize an empty array
    const getUsers = () => {
        const storedUsers = localStorage.getItem('users');
        return storedUsers ? JSON.parse(storedUsers) : [];
    };

    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    // Handle sign-up form submission
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const name = document.getElementById('signup-name').value.trim();
        const address = document.getElementById('signup-address').value.trim();
        const location = document.getElementById('signup-location').value.trim();
        const severity = document.getElementById('signup-severity').value;

        const users = getUsers();

        // Check if username already exists
        const isUsernameTaken = users.some(user => user.username.toLowerCase() === username.toLowerCase());
        if (isUsernameTaken) {
            alert('Username already exists. Please choose a different one.');
            return;
        }

        const newUser = {
            username,
            password,
            name,
            address,
            location,
            severity,
            photoPath: "placeholder.jpg" // Default placeholder
        };

        users.push(newUser);
        saveUsers(users);

        alert('Sign-up successful! You can now log in.');
        signUpForm.reset();
        signUpForm.classList.add('hidden');
        signInForm.classList.remove('hidden');
    });

    // Handle sign-in form submission
    document.getElementById('signin-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signin-username').value.trim();
        const password = document.getElementById('signin-password').value;

        const users = getUsers();

        const user = users.find(user => user.username.toLowerCase() === username.toLowerCase() && user.password === password);

        if (user) {
            alert(`Welcome, ${user.name}! Redirecting to the dashboard.`);
            window.location.href = 'health_monitoring_system.html';
        } else {
            alert('Invalid username or password. Please try again.');
        }
    });

    // Export users to an Excel file
    document.getElementById('export-to-excel').addEventListener('click', () => {
        const users = getUsers();

        // Convert data to CSV format
        let csvContent = "data:text/csv;charset=utf-8,Username,Name,Address,Location,Severity\n";
        users.forEach(user => {
            const row = `${user.username},${user.name},${user.address},${user.location},${user.severity}`;
            csvContent += row + "\n";
        });

        // Create a downloadable link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'signup_details.csv');
        document.body.appendChild(link);

        // Trigger download
        link.click();
        document.body.removeChild(link);
    });
});

// Get user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                document.getElementById('signup-location').value = `Latitude: ${latitude}, Longitude: ${longitude}`;
            },
            (error) => {
                alert('Error fetching location: ' + error.message);
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}
