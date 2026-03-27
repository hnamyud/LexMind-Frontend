import { Sequence, AbsoluteFill } from "remotion";
import { Slide1Pain } from "./Slide1Pain";
import { Slide2Solution } from "./Slide2Solution";
import { Slide3Action } from "./Slide3Action";
import { Slide4Result } from "./Slide4Result";
import { Slide5CTA } from "./Slide5CTA";


export const LexMindPresentation: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#050505" }}>
      <Sequence from={0} durationInFrames={300}>
        <Slide1Pain />
      </Sequence>
      <Sequence from={300} durationInFrames={300}>
        <Slide2Solution />
      </Sequence>
      <Sequence from={600} durationInFrames={300}>
        <Slide3Action />
      </Sequence>
      <Sequence from={900} durationInFrames={390}>
        <Slide4Result />
      </Sequence>
      <Sequence from={1290} durationInFrames={210}>
        <Slide5CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
