"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import Image from "next/image";
import "./styles.css";

export default function Overview() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          {/* Updated Header */}
          <Header title="How do I use these dashboards?" subtitle="" year="" />
          <div style={{ display: "flex", flexGrow: 1, padding: "40px" }}>
            {/* Left Section */}
            <div style={{ flex: 1, paddingRight: "40px" }}>
              {/* Main Content */}
              <main style={{ padding: "40px" }}>
                <ol style={{ lineHeight: "1.8" }}>
                  <li>
                    <h2 className="guide-h2">General Tips</h2>
                    <ul>
                      <li>
                        Use the menu on the left to easily navigate between
                        dashboards.
                      </li>
                    </ul>
                    {/* <p>
                      Click the download icon in the top right corner to
                      download a dashboard as a PDF. Note: Any filters applied
                      to dashboards will transfer to the PDF.
                    </p> */}
                  </li>

                  <li>
                    <h2 className="guide-h2">Dashboard Tips</h2>
                    <ul>
                      <li>
                        Most dashboards are interactive, and can be filtered by
                        various categories, or changed to display different
                        categories.
                      </li>
                    </ul>
                    <p>
                      Click the download icon in the top right corner to
                      download a dashboard as a PDF. Note: Any filters applied
                      to dashboards will transfer to the PDF.
                    </p>
                  </li>
                </ol>
              </main>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src="/screenshot.jpg"
                alt="Screenshot"
                layout="responsive" // Ensures the image scales properly
                width={500}
                height={500}
                style={{ objectFit: "cover", borderRadius: "0" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
