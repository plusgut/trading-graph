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

const GRAPH_WIDTH = 1200;
const GRAPH_HEIGHT = 300;

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
              rows={20}
              columns={200}
              value={purchasesState}
              onchange={purchases.dispatch}
            />
            <Try
              key={purchasesState}
              catch={() => (
                <>
                  <p>No Valid data, please format each row like this:</p>
                  <p>2021-01-26|A2DVB9|7.67|500</p>
                </>
              )}
            >
              {() => {
                const purchases = getParsedPurchases(purchasesState);
                const accumulatedValues = getAccumulatedValues(purchases);

                return (
                  <div>
                    <LinearGraph
                      width={GRAPH_WIDTH}
                      height={GRAPH_HEIGHT}
                      values={accumulatedValues.map((purchase, index) => ({
                        x: index,
                        y: purchase.accBuyIn,
                        tootlip: `${purchase.accBuyIn}`,
                      }))}
                      maxYValue={Math.max(
                        ...accumulatedValues.map(
                          (purchase) => purchase.accBuyIn
                        )
                      )}
                      maxXValue={accumulatedValues.length - 1}
                      getYLabel={(x) => `${x}€`}
                      getXLabel={(y) =>
                        accumulatedValues[y].buyDate.toDateString()
                      }
                      yTargetRows={accumulatedValues.length - 1}
                      xTargetColumns={10}
                    />
                    <LinearGraph
                      width={GRAPH_WIDTH}
                      height={GRAPH_HEIGHT}
                      values={accumulatedValues.map((purchase, index) => ({
                        x: index,
                        y: purchase.accValue,
                        tootlip: `${purchase.accValue}`,
                      }))}
                      maxYValue={Math.max(
                        ...accumulatedValues.map(
                          (purchase) => purchase.accValue
                        )
                      )}
                      maxXValue={accumulatedValues.length - 1}
                      getYLabel={(x) => `${x}€`}
                      getXLabel={(y) =>
                        accumulatedValues[y].buyDate.toDateString()
                      }
                      yTargetRows={accumulatedValues.length - 1}
                      xTargetColumns={10}
                    />
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
