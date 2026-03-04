import React from 'react';
import { config } from '../../api/config/env';
import LightPillar from '../components/ui/LightPillar';

function Home() {
  const { threeBgTopColor, threeBgBottomColor, threeBgSize } = config;

  return (
    <>
      <div className="wrapper home">
        <div className="bg_color">
          <LightPillar
            topColor={threeBgTopColor}
            bottomColor={threeBgBottomColor}
            intensity={1}
            rotationSpeed={0.3}
            glowAmount={0.002}
            pillarWidth={threeBgSize}
            pillarHeight={0.4}
            noiseIntensity={0.5}
            pillarRotation={25}
            interactive={false}
            mixBlendMode="screen"
            quality="high"
          />
        </div>
        <div className="container">
          <section className="index">
            <h1>Hi</h1>
            <p>desc</p>
          </section>
        </div>
      </div>
    </>
  );
}

export default Home;