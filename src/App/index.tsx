import plusnew, { component, PortalExit, store, Try } from "@plusnew/core";
import LinearGraph from "components/LinearGraph";
import TextArea from "components/TextArea";
import localStoreFactory from "util/localStoreFactory";

const PURCHASE_PIECES = 4;
function getParsedPurchases(value: string) {
  return value.split("\n").map((line) => {
    const result = line.split("|");
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

function getAccumulatedValues(
  values: {
    buyDate: Date;
    buyInIndividualPrice: number;
    buyInTotal: number;
  }[]
) {
  return values.reduce((accumulator, currentValue, currentIndex) => {
    const lastAccumulatedValue = accumulator[accumulator.length - 1];

    return currentIndex === 0
      ? [
          {
            buyDate: currentValue.buyDate,
            accBuyIn: currentValue.buyInTotal,
            accValue: currentValue.buyInTotal,
            buyInIndividualPrice: currentValue.buyInIndividualPrice,
          },
        ]
      : [
          ...accumulator,
          {
            buyDate: currentValue.buyDate,
            accBuyIn: currentValue.buyInTotal + lastAccumulatedValue.accBuyIn,
            accValue:
              (lastAccumulatedValue.accValue /
                lastAccumulatedValue.buyInIndividualPrice) *
                currentValue.buyInIndividualPrice +
              currentValue.buyInTotal,
            buyInIndividualPrice: currentValue.buyInIndividualPrice,
          },
        ];
  }, [] as { buyDate: Date; accBuyIn: number; accValue: number; buyInIndividualPrice: number }[]);
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

const GRAPH_WIDTH = 1200;
const GRAPH_HEIGHT = 300;
const GRAPH_Y_TARGET_ROWS = 10;
const TEXTAREA_ROWS = 20;
const TEXTAREA_COLUMNS = 200;

export default component("App", () => {
  const purchases = localStoreFactory("stocks", "", (value) => store(value));

  return (
    <>
      <div style={{ position: "absolute" }}>
        <PortalExit name="drawboard" />
      </div>
      <purchases.Observer>
        {(purchasesState) => (
          <>
            <TextArea
              rows={TEXTAREA_ROWS}
              columns={TEXTAREA_COLUMNS}
              value={purchasesState}
              onchange={purchases.dispatch}
            />
            <Try
              key={purchasesState}
              catch={() => (
                <>
                  <p>No Valid data, please format each row like this:</p>
                  <p>
                    2021-01-26|A2DVB9|7.67|500
                    <br />
                    2021-01-27|A2DVB9|8|500
                    <br />
                    2021-01-28|A2DVB9|8.2|500
                  </p>
                </>
              )}
            >
              {() => {
                const purchases = getParsedPurchases(purchasesState);
                const wkns = getWkns(purchases);
                const accumulatedValuesList = wkns.map((wkn) =>
                  getAccumulatedValues(
                    purchases.filter((purchase) => purchase.wkn === wkn)
                  )
                );

                return (
                  <div>
                    {accumulatedValuesList.map((accumulatedValues, index) => (
                      <>
                        <div>{wkns[index]}:</div>
                        <LinearGraph
                          width={GRAPH_WIDTH}
                          height={GRAPH_HEIGHT}
                          lines={[
                            {
                              color: "blue",
                              values: accumulatedValues.map(
                                (purchase, index) => ({
                                  x: index,
                                  y: purchase.accBuyIn,
                                  tootlip: `${purchase.accBuyIn}`,
                                })
                              ),
                            },

                            {
                              color: "red",
                              values: accumulatedValues.map(
                                (purchase, index) => ({
                                  x: index,
                                  y: purchase.accValue,
                                  tootlip: `${purchase.accValue}`,
                                })
                              ),
                            },
                          ]}
                          maxYValue={Math.max(
                            ...accumulatedValues
                              .map((purchase) => [
                                purchase.accBuyIn,
                                purchase.accValue,
                              ])
                              .flat()
                          )}
                          maxXValue={accumulatedValues.length - 1}
                          getYLabel={(y) => `${y}€`}
                          getXLabel={(x) =>
                            accumulatedValues[x].buyDate.toDateString()
                          }
                          yTargetRows={GRAPH_Y_TARGET_ROWS}
                          xTargetColumns={accumulatedValues.length}
                        />
                      </>
                    ))}
                  </div>
                );
              }}
            </Try>
          </>
        )}
      </purchases.Observer>
    </>
  );
});
