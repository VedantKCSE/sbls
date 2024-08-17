// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [schedule, setSchedule] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [nextLecture, setNextLecture] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '',
    day: '',
    time: ''
  });

  useEffect(() => {
    fetch('https://vedantk3.pythonanywhere.com/api/today')
      .then(response => response.json())
      .then(data => {
        setSchedule(data.schedule);
        determineCurrentAndNextLecture(data.schedule);
      })
      .catch(error => {
        console.error('Error fetching schedule:', error);
      });

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000); // Update time every second

    return () => clearInterval(timer);
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString(undefined, options);
    const time = now.toLocaleTimeString();
    const day = now.toLocaleDateString(undefined, { weekday: 'long' });

    setCurrentDateTime({ date, day, time });
  };

  const determineCurrentAndNextLecture = (schedule) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    let current = null;
    let next = null;

    for (let i = 0; i < schedule.length; i++) {
      const startTime = convertTimeToMinutes(schedule[i].start_time);
      const endTime = convertTimeToMinutes(schedule[i].end_time);

      if (currentTime >= startTime && currentTime < endTime) {
        current = schedule[i];
        next = schedule[i + 1] || null; // Next lecture
        break;
      } else if (currentTime < startTime) {
        next = schedule[i];
        break;
      }
    }

    setCurrentLecture(current);
    setNextLecture(next);
  };

  const convertTimeToMinutes = (time) => {
    const [hour, minute] = time.split(':');
    const isPM = time.includes('PM');
    let hours = parseInt(hour, 10);
    const minutes = parseInt(minute, 10);

    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  };

  return (
    <div className="dashboard-container">
      <div className="titles">

        <h1>Today's Schedule</h1>

        <div className="current-date-time">
          <p><strong>Date:</strong> {currentDateTime.date}</p>
          <p><strong>Day:</strong> {currentDateTime.day}</p>
          <p><strong>Time:</strong> {currentDateTime.time}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Lecture</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(item => (
            <tr
              key={item.id}
              className={
                currentLecture && currentLecture.id === item.id
                  ? 'current-lecture'
                  : nextLecture && nextLecture.id === item.id
                    ? 'next-lecture'
                    : ''
              }
            >
              <td>{item.lecture}</td>
              <td>{item.start_time}</td>
              <td>{item.end_time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="current-next-info">
        {currentLecture && (
          <div>
            <strong>Current Lecture:</strong> {currentLecture.lecture} ({currentLecture.start_time} - {currentLecture.end_time})
          </div>
        )}
        {nextLecture && (
          <div>
            <strong>Next Lecture:</strong> {nextLecture.lecture} ({nextLecture.start_time} - {nextLecture.end_time})
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
