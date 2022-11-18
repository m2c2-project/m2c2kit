import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
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
            to="/docs/examples"
            style={{ margin: "0.5em" }}
          >
            Examples - 📱
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/tutorial-fundamentals/fundamentals"
            style={{ margin: "0.5em" }}
          >
            Interactive Tutorial - 🖥️
            {/* Docusaurus Tutorial - 5min ⏱️ */}
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
