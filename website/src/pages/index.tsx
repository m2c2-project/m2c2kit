import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div
          className={styles.buttons}
          style={{ flexFlow: "row wrap", justifyContent: "center" }}
        >
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
            style={{ margin: "0.5em" }}
          >
            Introduction - 📖
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/category/examples"
            style={{ margin: "0.5em" }}
          >
            Examples - 📱
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/tutorials/fundamentals/introduction"
            style={{ margin: "0.5em" }}
          >
            Interactive Tutorial - 🖥️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="a library for cross-platform cognitive assessments"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
