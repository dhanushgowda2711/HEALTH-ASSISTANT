document.addEventListener('DOMContentLoaded', () => {

    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');

    // Remove splash screen after 5 seconds
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
    }, 5000);

    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    // Handle tab switching
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            contents[index].classList.add('active');
        });
    });

    // Fetch the latest data from the Flask server
    const FLASK_API_URL = 'https://health-assistant-1epb.onrender.com/esp32-data';  // Change this to your Flask API endpoint

    let temperature = '--';
    let humidity = '--';
    let pulse = '--';
    let bodyTemperature = '--';
    let ecg = '--';

    const timeLabels = [];
    const temperatureData = [];
    const humidityData = [];
    const pulseData = [];
    const bodyTemperatureData = [];
    const ecgData = [];

    function fetchSensorData() {
        fetch(FLASK_API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Update variables with data
                temperature = data.temperature || '--';
                humidity = data.humidity || '--';
                pulse = data.pulse || '--';
                bodyTemperature = data.body_temperature || '--';
                ecg = data.ecg || '--';

                // Update HTML elements
                document.getElementById('temperature').textContent = `${temperature} °C`;
                document.getElementById('humidity').textContent = `${humidity} %`;
                document.getElementById('heart-rate').textContent = `${pulse} bpm`;
                document.getElementById('bodytemperature').textContent = `${bodyTemperature} °C`;
                document.getElementById('ecg-result').textContent = `${ecg}`;

                // Update chart data
                const time = new Date().toLocaleTimeString();
                if (timeLabels.length >= 288) {
                    timeLabels.shift();
                    temperatureData.shift();
                    humidityData.shift();
                    pulseData.shift();
                    bodyTemperatureData.shift();
                    ecgData.shift();
                }

                timeLabels.push(time);
                temperatureData.push(temperature);
                humidityData.push(humidity);
                pulseData.push(pulse);
                bodyTemperatureData.push(bodyTemperature);
                ecgData.push(ecg);

                updateCharts();
            })
            .catch(error => console.error('Error fetching sensor data:', error));
    }

    setInterval(fetchSensorData, 3000); // Fetch every 3 seconds
    fetchSensorData(); // Initial fetch

    // Initialize Charts
    const ctxMain = document.getElementById('healthChart').getContext('2d');
    const healthChart = new Chart(ctxMain, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                { label: 'Temperature (°C)', data: temperatureData, borderColor: 'rgba(255, 99, 132, 1)', fill: false },
                { label: 'Humidity (%)', data: humidityData, borderColor: 'rgba(54, 162, 235, 1)', fill: false },
                { label: 'Pulse Rate (bpm)', data: pulseData, borderColor: 'rgba(75, 192, 192, 1)', fill: false },
                { label: 'Body Temperature (°C)', data: bodyTemperatureData, borderColor: 'rgba(153, 102, 255, 1)', fill: false },
            ],
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });

    const ctxECG = document.getElementById('ecgChart').getContext('2d');
    const ecgChart = new Chart(ctxECG, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{ label: 'ECG Data', data: ecgData, borderColor: 'rgba(255, 159, 64, 1)', fill: false }],
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });

    function updateCharts() {
        healthChart.data.labels = timeLabels;
        healthChart.data.datasets[0].data = temperatureData;
        healthChart.data.datasets[1].data = humidityData;
        healthChart.data.datasets[2].data = pulseData;
        healthChart.data.datasets[3].data = bodyTemperatureData;
        healthChart.update();

        ecgChart.data.labels = timeLabels;
        ecgChart.data.datasets[0].data = ecgData;
        ecgChart.update();
    }

        function sendEmail() {
        const emailData = {
            patient_name: 'John Doe',
            patient_age: '45',
            patient_gender: 'Male',
            temperature: temperature,
            pulse: pulse,
            humidity: humidity,
            body_temperature: bodyTemperature,
            ecg: ecg
        };

        emailjs.send('service_3fgtmrj', 'template_5rs54lh')
            .then((response) => {
                console.log('Email sent successfully:', response);
            }, (error) => {
                console.error('Error sending email:', error);
            });
    }

    // Send email every 5 minutes (300000 ms)
    setInterval(sendEmail, 300000); // Every 5 minutes

    sendEmail();

  document.getElementById('downloadBtn').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Set styles
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title Section - Health Assistant at the top
    doc.setFillColor(0, 150, 136); // Green background
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255); // White text
    doc.text('Health Assistant', pageWidth / 2, 20, null, null, 'center');

    // Subtitle Section - Patient Health Report below Health Assistant
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text
    doc.text('Patient Health Report', pageWidth / 2, 40, null, null, 'center');

    // Patient Details Table
    const startY1 = 50;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 77, 64); // Teal text
    doc.text('Patient Details', 14, startY1);

    const patientData = [
        ['Name', 'John Doe'],
        ['Age', '45'],
        ['Gender', 'Male']
    ];

    const tableStartY1 = startY1 + 10;
    const tableWidth1 = 180;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33); // Dark grey text
    let currentY1 = tableStartY1;

    patientData.forEach(row => {
        doc.rect(14, currentY1, tableWidth1, 10); // Row border
        doc.text(row[0], 16, currentY1 + 7); // First column
        doc.text(row[1], 105, currentY1 + 7, null, null, 'center'); // Second column
        currentY1 += 10;
    });

    // Threshold Table
    const startY2 = currentY1 + 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 77, 64); // Teal text
    doc.text('Threshold Values', 14, startY2);

    const thresholdData = [
        ['Temperature Threshold', '37.5 °C'],
        ['Humidity Threshold', '60%'],
        ['Pulse Rate Threshold', '100 bpm'],
        ['Body Temperature Threshold', '37.0 °C'],
        ['ECG Threshold', '1.5 mV']
    ];

    const tableStartY2 = startY2 + 10;
    const tableWidth2 = 180;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33); // Dark grey text
    let currentY2 = tableStartY2;

    thresholdData.forEach(row => {
        doc.rect(14, currentY2, tableWidth2, 10); // Row border
        doc.text(row[0], 16, currentY2 + 7); // First column
        doc.text(row[1], 105, currentY2 + 7, null, null, 'center'); // Second column
        currentY2 += 10;
    });

    // Sensor Data Table
    const startY3 = currentY2 + 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 77, 64); // Teal text
    doc.text('Sensor Data', 14, startY3);

    const sensorData = [
        ['Temperature', `${temperature} °C`],
        ['Humidity', `${humidity} %`],
        ['Pulse Rate', `${pulse} bpm`],
        ['Body Temperature', `${bodyTemperature} °C`],
        ['ECG Value', `${ecg}`],
    ];

    const tableStartY3 = startY3 + 10;
    const tableWidth3 = 180;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 33, 33); // Dark grey text
    let currentY3 = tableStartY3;

    sensorData.forEach(row => {
        doc.rect(14, currentY3, tableWidth3, 10); // Row border
        doc.text(row[0], 16, currentY3 + 7); // First column
        doc.text(row[1], 105, currentY3 + 7, null, null, 'center'); // Second column
        currentY3 += 10;
    });

    // Add Graphs Section
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 77, 64); // Teal text
    doc.text('Health Trends', 14, 20);

    // Add Health Chart Image
    const healthChartImage = healthChart.toBase64Image();
    doc.addImage(healthChartImage, 'PNG', 15, 30, 180, 80);

    // Add ECG Chart Image
    const ecgChartImage = ecgChart.toBase64Image();
    doc.addImage(ecgChartImage, 'PNG', 15, 120, 180, 80);

    // Footer Section with page numbering
    const footerY = pageHeight - 20;
    doc.setFillColor(240, 240, 240); // Light grey background
    doc.rect(0, footerY, pageWidth, 10, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(97, 97, 97); // Light grey text
    doc.text('Generated on: ' + new Date().toLocaleString(), 14, footerY + 7);
    
    // Add page number
    const pageCount = doc.internal.getNumberOfPages();
    doc.text('Page ' + doc.internal.getCurrentPageInfo().pageNumber + ' of ' + pageCount, pageWidth - 20, footerY + 7, null, null, 'right');

    // Save the PDF
    doc.save('Patient_Health_Report.pdf');
});

});


