import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Mobile first",
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Svg: require("@site/static/img/phone-tablet-and-laptop.svg").default,
    description: (
      <>Optimized for touch and mobile devices while also usable on desktops.</>
    ),
  },
  {
    title: "Portable",
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Svg: require("@site/static/img/wheelbarrow.svg").default,
    description: (
      <>
        Use on browsers, compile within native apps, or embed in products like
        Qualtrics. A shared assessment codebase reduces development time and
        promotes experiment standardization across devices and services.
      </>
    ),
  },
  {
    title: "Rapid iteration",
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Svg: require("@site/static/img/flash-clock.svg").default,
    description: (
      <>
        Quickly develop and test new assessments with the JavaScript-based
        library and deploy them in studies.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
