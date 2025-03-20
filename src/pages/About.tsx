import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-2xl p-8">
        <h1 className="text-3xl font-heading font-medium mb-6">About</h1>
        <div className="space-y-4 text-gray-600">
          <p>
            Word size indicates frequency in parliamentary speeches. Common words and parliamentary terms have been filtered out.
          </p>
          <p>
            The data on this site is accurate between the 17th July 2024 and the 6th March 2025.
          </p>
          <p>
            Every effort has been made to make this site accurate, but feel free to contact us if you experience any errors.
          </p>
          <p>
            The source code is available{" "}
            <a 
              href="https://github.com/mp-kanishka/kanishka-kloud" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              here
            </a>
            .
          </p>
        </div>

        {/* Home icon in bottom left corner */}
        <Link
          to="/"
          className="fixed left-4 bottom-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Return to home"
        >
          <Home className="w-5 h-5 text-gray-600" />
        </Link>
      </div>
    </div>
  );
};

export default About; 
