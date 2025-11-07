import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div style={{ backgroundColor: 'red' }}>
      <div className="header">
      </div>
      
      <div className="about-content">
        <div className="about-left">
          <div className="profile-image">
            <img 
              src="http://localhost:3845/assets/f7fdaaf79d3bad8c06b9f42058275cfe709b2011.png" 
              alt="Olivia Hingley"
            />
          </div>
          
          <div className="bio">
            <p>
              Olivia (she/her) is associate editor of the website, working across editorial projects and features as well as Nicer Tuesdays events. She joined the It's Nice That team in 2021. Feel free to get in touch with any stories, ideas or pitches.
            </p>
          </div>
          
          <div className="contact">
            <a href="mailto:ofh@NicerTuesdays.com">
              Contact: ofh@NicerTuesdays.com
            </a>
          </div>
        </div>
        
        <div className="about-right">
          <div className="speaking-section">
            <h2 className="section-title">Public Speaking</h2>
            
            <div className="speaking-list">
              <div className="speaking-item">
                <span className="speaker-label">Speaker @</span>
                <span className="event-name">Nicer Tuesdays event 2025</span>
              </div>
              
              <div className="speaking-item highlighted">
                <span className="speaker-label">Speaker @</span>
                <span className="event-name">Nicer Tuesdays event 2024</span>
              </div>
              
              <div className="speaking-item">
                <span className="speaker-label">Speaker @</span>
                <span className="event-name">Nicer Tuesdays event 2023</span>
              </div>
              
              <div className="speaking-item">
                <span className="speaker-label">Speaker @</span>
                <span className="event-name">Nicer Tuesdays event 2022</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}