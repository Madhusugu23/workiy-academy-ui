import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../config/config";
import "./course.css"; // Import the CSS file

const CheckIcon = ({ color = "#10b981", size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={color} opacity="0.12" />
    <path
      d="M8 12.5l2.5 2.5L16.5 9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Course = () => {
  useEffect(() => {
    document.body.classList.add("hide-scrollbar");
    document.documentElement.classList.add("hide-scrollbar");
    return () => {
      document.body.classList.remove("hide-scrollbar");
      document.documentElement.classList.remove("hide-scrollbar");
    };
  }, []);

  const coursePath = window.location.pathname.split("/").pop();
  const [courseData, setCourse] = useState(null);

  useEffect(() => {
    axios
      .get(`${config.apiUrl}/course-details/${coursePath}`)
      .then((res) => {
        setCourse(res.data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [coursePath]);
  console.log("Course Data:", courseData);

  if (!courseData) {
    return <div style={{ padding: 20 }}>Loading course details...</div>;
  }

  return (
    <div className="page">
      <div className="card">
        {/* HERO */}
        <div className="hero">
          <div style={{ flex: 1, minWidth: "250px" }}>
            <div className="heroTitle">{courseData.hero.title}</div>
            <div className="heroCaption">{courseData.hero.caption}</div>
            <button className="heroCta">
              <a href="/contact" target="_self" className="heroCta">
                Enroll Now
              </a>
            </button>
          </div>
          <img
            src={courseData.hero.image}
            alt="Instructor"
            className="heroRightImage"
          />
        </div>

        {/* BADGES */}
        <div className="heroBadges">
          {courseData.badges.map((badge, i) => (
            <div key={i} className="badge">
              {badge}
            </div>
          ))}
        </div>

        {/* SECTIONS */}
        {courseData.sections.map((section, sIndex) => (
          <section key={sIndex} className="section">
            <div className="sectionTitle">{section.title}</div>

            {section.type === "bullets" && (
              <ul className="bulletList">
                {section.items.map((point, i) => (
                  <li key={i} className="bulletItem">
                    <CheckIcon />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {section.type === "modules" && (
              <div className="modules">
                {section.items.map((m, i) => (
                  <div key={i} className="moduleItem">
                    <div className="moduleIndex">{i + 1}</div>
                    <div>{m}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {/* HIGHLIGHTS */}
        <div className="highlights">
          {courseData.highlights.map((h, i) => (
            <div key={i} className="highlightItem">
              {h}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Course;