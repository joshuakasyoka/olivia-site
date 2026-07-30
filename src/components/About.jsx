import { useRef } from 'react'
import profileImage from '../assets/olivia-portrait.png'
import { gsap, useGSAP } from '../lib/gsap'

export default function About() {
  const pageRef = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        motionOk: '(prefers-reduced-motion: no-preference)',
      },
      (context) => {
        const { reduceMotion } = context.conditions
        const image = pageRef.current?.querySelector('.profile-image')
        const bio = pageRef.current?.querySelector('.bio')
        const contact = pageRef.current?.querySelector('.contact')
        const title = pageRef.current?.querySelector('.section-title')
        const speakingItems = pageRef.current?.querySelectorAll('.speaking-item')

        if (reduceMotion) {
          gsap.set([image, bio, contact, title, speakingItems], { autoAlpha: 1, y: 0, scale: 1 })
          return
        }

        gsap.set(image, { autoAlpha: 0, scale: 1.06, y: 24 })
        gsap.set([bio, contact], { autoAlpha: 0, y: 20 })
        gsap.set(title, { autoAlpha: 0, y: 16 })
        gsap.set(speakingItems, { autoAlpha: 0, x: -18 })

        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })

        intro
          .to(image, { autoAlpha: 1, scale: 1, y: 0, duration: 1.05 })
          .to(bio, { autoAlpha: 1, y: 0, duration: 0.75 }, '-=0.55')
          .to(contact, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.4')
          .to(title, { autoAlpha: 1, y: 0, duration: 0.65 }, '-=0.45')

        gsap.to(speakingItems, {
          autoAlpha: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.speaking-list',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })

        // Gentle parallax on the portrait while scrolling
        gsap.to(image, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: pageRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      }
    )

    return () => mm.revert()
  }, { scope: pageRef })

  return (
    <div className="about-page" ref={pageRef}>
      <div className="container">
        <div className="header">
        </div>

        <div className="about-content">
          <div className="about-left">
            <div className="profile-image">
              <img
                src={profileImage}
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
            <h2 className="section-title">Upcoming Speaking</h2>

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
    </div>
  )
}
