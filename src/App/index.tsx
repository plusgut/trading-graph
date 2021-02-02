import plusnew, {
  Async,
  component,
  PortalExit,
  store,
  Try,
} from "@plusnew/core";
import i18n from "components/i18n";
import LinearGraph from "components/LinearGraph";
import Size from "components/Size";
import style from "./app.css";

const PURCHASE_PIECES = 4;
const DELIMITER = ",";
type purchase = {
  buyDate: Date;
  wkn: string;
  buyInIndividualPrice: number;
  buyInTotal: number;
};

type accumulatedPurchase = {
  buyDate: Date;
  wkn: string;
  accBuyIn: number;
  accValue: number;
  buyInIndividualPrice: number;
};
function getParsedPurchases(value: string): purchase[] {
  return value.split("\n").map((line) => {
    const result = line.split(DELIMITER);
    if (result.length === PURCHASE_PIECES) {
      const [buyDate, wkn, buyInIndividualPrice, buyInTotal] = result;
      return {
        buyDate: new Date(buyDate),
        wkn,
        buyInIndividualPrice: Number(buyInIndividualPrice),
        buyInTotal: Number(buyInTotal),
      };
    }
    throw new Error("Meh");
  });
}

function getAccumulatedValues(values: purchase[]): accumulatedPurchase[] {
  return values.reduce<accumulatedPurchase[]>(
    (accumulator, currentValue, currentIndex) => {
      const lastAccumulatedValue = accumulator[accumulator.length - 1];

      return currentIndex === 0
        ? [
            {
              buyDate: currentValue.buyDate,
              wkn: currentValue.wkn,
              accBuyIn: currentValue.buyInTotal,
              accValue: currentValue.buyInTotal,
              buyInIndividualPrice: currentValue.buyInIndividualPrice,
            },
          ]
        : [
            ...accumulator,
            {
              buyDate: currentValue.buyDate,
              wkn: currentValue.wkn,
              accBuyIn: currentValue.buyInTotal + lastAccumulatedValue.accBuyIn,
              accValue:
                (lastAccumulatedValue.accValue /
                  lastAccumulatedValue.buyInIndividualPrice) *
                  currentValue.buyInIndividualPrice +
                currentValue.buyInTotal,
              buyInIndividualPrice: currentValue.buyInIndividualPrice,
            },
          ];
    },
    []
  );
}

function getUniqueDates<T extends { buyDate: Date }>(purchases: T[]) {
  return purchases.filter(
    (purchase, index) =>
      purchases.findIndex(
        (findPurchase) =>
          findPurchase.buyDate.getTime() === purchase.buyDate.getTime()
      ) === index
  );
}

function getSummedAccumulatedValues(
  accumulatedValuesList: accumulatedPurchase[][]
) {
  const purchaseDates = getUniqueDates(
    accumulatedValuesList.map(getUniqueDates).flat()
  )
    .map((accumulatedValues) => accumulatedValues.buyDate)
    .sort((a, b) => a.getTime() - b.getTime());

  return purchaseDates.map((date) => {
    return {
      buyDate: date,
      accBuyIn: accumulatedValuesList
        .map((accumulatedValues) =>
          getNearestAccumulatedPurchase(accumulatedValues, date)
        )
        .reduce((sum, currentPurchase) => sum + currentPurchase.accBuyIn, 0),
      accValue: accumulatedValuesList
        .map((accumulatedValues) =>
          getNearestAccumulatedPurchase(accumulatedValues, date)
        )
        .reduce((sum, currentPurchase) => sum + currentPurchase.accValue, 0),
    };
  });
}

function getNearestAccumulatedPurchase(
  accumulatedPurchases: accumulatedPurchase[],
  searchDate: Date
) {
  const result = accumulatedPurchases.reduce<accumulatedPurchase>(
    (previousPurchase, accumulatedPurchase) => {
      const previousTimeDiff = getTimeDiff(
        searchDate,
        previousPurchase.buyDate
      );
      const currentTimeDiff = getTimeDiff(
        searchDate,
        accumulatedPurchase.buyDate
      );
      if (currentTimeDiff < 0) {
        return previousPurchase;
      }
      if (previousTimeDiff < currentTimeDiff) {
        return previousPurchase;
      }
      return accumulatedPurchase;
    },
    {
      buyDate: new Date(0),
      accBuyIn: 0,
      accValue: 0,
      buyInIndividualPrice: 0,
      wkn: accumulatedPurchases[0].wkn,
    }
  );

  return result;
}

function getWkns(purchases: { wkn: string }[]) {
  return purchases
    .filter(
      (purchase, index) =>
        purchases.findIndex(
          (findPurchase) => findPurchase.wkn === purchase.wkn
        ) === index
    )
    .map((purchase) => purchase.wkn);
}

function getTimeDiff(a: Date, b: Date) {
  return a.getTime() - b.getTime();
}

function getLocationHash() {
  return window.location.hash === "" || window.location.hash === "#"
    ? null
    : window.location.hash.slice(1);
}

const GRAPH_Y_TARGET_ROWS = 10;
const GRAPH_X_COLUMNS = 20;
const HEADLINE_HEIGHT = 18;

export default component("App", () => {
  const hash = store(getLocationHash());

  window.addEventListener("hashchange", () => hash.dispatch(getLocationHash()));

  return (
    <>
      <div class={style.drawboard}>
        <PortalExit name="drawboard" />
      </div>
      <i18n.Consumer>
        {({ base }) => (
          <hash.Observer>
            {(hashState) =>
              hashState === null ? (
                base()?.noGist
              ) : (
                <Try key={hashState} catch={() => base()?.gistError}>
                  {() => (
                    <Async
                      constructor={async () => {
                        const [result] = Object.values(
                          (
                            await (
                              await fetch(
                                `https://api.github.com/gists/${hashState}`
                              )
                            ).json()
                          ).files
                        );

                        return (result as { content: string }).content;
                      }}
                      pendingIndicator={base()?.loading ?? ""}
                    >
                      {(response) => (
                        <Try
                          catch={() => (
                            <>
                              <p>{base()?.invalidData}:</p>
                              <p>
                                2021-01-26,A2DVB9,7.67,500
                                <br />
                                2021-01-27,A2DVB9,8,500
                                <br />
                                2021-01-28,A2DVB9,8.2,500
                              </p>
                            </>
                          )}
                        >
                          {() => {
                            const purchases = getParsedPurchases(response);
                            const wkns = getWkns(purchases);
                            const accumulatedValuesList = wkns.map((wkn) =>
                              getAccumulatedValues(
                                purchases.filter(
                                  (purchase) => purchase.wkn === wkn
                                )
                              )
                            );

                            const summedAccumulatedValues = getSummedAccumulatedValues(
                              accumulatedValuesList
                            );

                            const maxYValue = Math.max(
                              ...summedAccumulatedValues
                                .map((purchase) => [
                                  purchase.accBuyIn,
                                  purchase.accValue,
                                ])
                                .flat()
                            );
                            const minDate = summedAccumulatedValues[0].buyDate;
                            const maxDate =
                              summedAccumulatedValues[
                                summedAccumulatedValues.length - 1
                              ].buyDate;

                            const dateDiff = getTimeDiff(maxDate, minDate);

                            return (
                              <Size>
                                {({ width }) => {
                                  const windowHeight = window.innerHeight;
                                  const graphCount =
                                    accumulatedValuesList.length + 1;
                                  const graphHeight =
                                    windowHeight / graphCount -
                                    graphCount * HEADLINE_HEIGHT;
                                  return (
                                    <>
                                      <div>sum:</div>
                                      <LinearGraph
                                        width={width}
                                        height={graphHeight}
                                        lines={[
                                          {
                                            color: "blue",
                                            values: summedAccumulatedValues.map(
                                              (purchase) => ({
                                                x: getTimeDiff(
                                                  purchase.buyDate,
                                                  minDate
                                                ),
                                                y: purchase.accBuyIn,
                                                tootlip: `${base()?.number(
                                                  purchase.accBuyIn
                                                )}`,
                                              })
                                            ),
                                          },

                                          {
                                            color: "red",
                                            values: summedAccumulatedValues.map(
                                              (purchase) => ({
                                                x: getTimeDiff(
                                                  purchase.buyDate,
                                                  minDate
                                                ),
                                                y: purchase.accValue,
                                                tootlip: `${base()?.number(
                                                  purchase.accValue
                                                )}`,
                                              })
                                            ),
                                          },
                                        ]}
                                        maxXValue={dateDiff}
                                        maxYValue={maxYValue}
                                        getYLabel={(y) =>
                                          `${base()?.number(y)}€`
                                        }
                                        getXLabel={(x) =>
                                          base()?.date(
                                            new Date(minDate.getTime() + x)
                                          ) ?? ""
                                        }
                                        yTargetRows={GRAPH_Y_TARGET_ROWS}
                                        xColumns={GRAPH_X_COLUMNS}
                                      />

                                      {accumulatedValuesList.map(
                                        (accumulatedValues, index) => (
                                          <>
                                            <div>{wkns[index]}:</div>
                                            <LinearGraph
                                              width={width}
                                              height={graphHeight}
                                              lines={[
                                                {
                                                  color: "blue",
                                                  values: accumulatedValues.map(
                                                    (purchase) => ({
                                                      x: getTimeDiff(
                                                        purchase.buyDate,
                                                        minDate
                                                      ),

                                                      y: purchase.accBuyIn,
                                                      tootlip: `${base()?.number(
                                                        purchase.accBuyIn
                                                      )}`,
                                                    })
                                                  ),
                                                },

                                                {
                                                  color: "red",
                                                  values: accumulatedValues.map(
                                                    (purchase) => ({
                                                      x: getTimeDiff(
                                                        purchase.buyDate,
                                                        minDate
                                                      ),

                                                      y: purchase.accValue,
                                                      tootlip: `${base()?.number(
                                                        purchase.accValue
                                                      )}`,
                                                    })
                                                  ),
                                                },
                                              ]}
                                              maxYValue={maxYValue}
                                              maxXValue={dateDiff}
                                              getYLabel={(y) =>
                                                `${base()?.number(y)}€`
                                              }
                                              getXLabel={(x) =>
                                                base()?.date(
                                                  new Date(
                                                    minDate.getTime() + x
                                                  )
                                                ) ?? ""
                                              }
                                              yTargetRows={GRAPH_Y_TARGET_ROWS}
                                              xColumns={GRAPH_X_COLUMNS}
                                            />
                                          </>
                                        )
                                      )}
                                    </>
                                  );
                                }}
                              </Size>
                            );
                          }}
                        </Try>
                      )}
                    </Async>
                  )}
                </Try>
              )
            }
          </hash.Observer>
        )}
      </i18n.Consumer>
    </>
  );
});
