import React from 'react'

/**
 * Functional React Component. This subtitle is the title of the page,
 * such as the How To Play page or Level Select page.
 * 
 * @param {object} props The properties to pass to this Subtitle.
 * 
 * @returns JSX that represents the Subtitle.
 */
export default function Subtitle({ text, className }) {
  return (
    <div className={`subtitle-bar center-children ${className}`}>
      <span className='subtitle-text'>{text}</span>
    </div>
  )
}
