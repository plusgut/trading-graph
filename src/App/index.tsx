import plusnew, { component, store, Try } from "@plusnew/core";
import LinearGraph from "components/LinearGraph";
import TextArea from "components/TextArea";
import localStoreFactory from "util/localStoreFactory";

const PURCHASE_PIECES = 4;
function getParsedPurchases(value: string) {
  return value.split("\n").map((line) => {
    const result = line.split("|");
    if (result.length === PURCHASE_PIECES) {
      const [buyDate, wkn, buyPrice, amount] = result;
      return {
        buyDate: new Date(buyDate),
        wkn,
        buyPrice: Number(buyPrice),
        amount: Number(amount),
      };
    }
    throw new Error("Meh");
  });
}

const GRAPH_WIDTH = 600;
const GRAPH_HEIGHT = 300;

export default component("App", () => {
  const purchases = localStoreFactory("stocks", "", (value) => store(value));

  return (
    <purchases.Observer>
      {(purchasesState) => (
        <>
          <TextArea
            rows={20}
            columns={200}
            value={purchasesState}
            onchange={purchases.dispatch}
          />
          <Try key={purchasesState} catch={() => "no valid data"}>
            {() => {
              const purchases = getParsedPurchases(purchasesState);
              console.log(purchases);
              return (
                <div>
                  <LinearGraph
                    width={GRAPH_WIDTH}
                    height={GRAPH_HEIGHT}
                    values={purchases.map((purchase, index) => ({
                      x: index,
                      y: purchase.amount,
                      tootlip: `${purchase.amount}`,
                    }))}
                    maxXValue={Math.max(
                      ...purchases.map((purchase) => purchase.amount)
                    )}
                    maxYValue={purchases.length - 1}
                    getYLabel={(x) => `${x}€`}
                    getXLabel={(y) => purchases[y].buyDate.toDateString()}
                    yTargetRows={purchases.length - 1}
                    xTargetColumns={10}
                  />
                </div>
              );
            }}
          </Try>
        </>
      )}
    </purchases.Observer>
  );
});
