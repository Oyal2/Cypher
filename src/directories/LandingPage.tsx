import React from 'react';
import '../App.css';

export function HomePage() {
  return (
    <div>
      <div className="highlight2">
        <p>CYPHER</p>
      </div>
      <div className="highlight3">
        <h3>Protection to a New Level</h3>
      </div>
      <div className="btn-group">
        <a href="/cypher/signin">
          <button className="button">Sign In</button>
        </a>
        <a href="/cypher/signup">
          <button className="button">Sign Up</button>
        </a>
      </div>
    </div>
  );
}
