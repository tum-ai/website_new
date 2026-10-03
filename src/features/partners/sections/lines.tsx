import { Fragment } from "react";

/**
 * Copy set on fixed lines (`PartnersSections`): the lines joined by line
 * breaks, the markup a heading written as `First<br />Second` renders.
 */
export function Lines({ lines }: { lines: readonly string[] }) {
  return lines.map((line, index) => (
    <Fragment key={line}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}
