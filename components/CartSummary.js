import { Price } from "./Price";

export const CartSummary = ({
    subtotal, 
    discount, 
    deliveryCharge, 
    usagePoint, 
    chargePoint, 
    total, 
    tax10ofTotal, 
    tax8ofTotal 
}) => {
    const noDeliveryCharge = deliveryCharge === undefined || deliveryCharge === null;
    const noUsagePoint = usagePoint === undefined || usagePoint === null;
    const noChargePoint = chargePoint === undefined || chargePoint === null;
    return <table>
        <tbody>
            <tr>
                <th className="p-4 pl-0 text-left">小計:</th>
                <td className="text-right"><Price value={subtotal}/></td>
            </tr>
            <tr>
                <th className="p-4 pl-0 text-left">値引き:</th>
                <td className="text-right"><Price value={discount}/></td>
            </tr>
            <tr>
                <th className="p-4 pl-0 text-left">送料:</th>
                <td className="text-right">{noDeliveryCharge ? '未確定' : <Price value={deliveryCharge}/>}</td>
            </tr>
            {!noUsagePoint && (
                <tr>
                    <th className="p-4 pl-0 text-left">使用ポイント:</th>
                    <td className="text-right"><Price value={usagePoint} hiddenTax/></td>
                </tr>
            )}
        </tbody>
        <tfoot className="border-t-2">
            <tr>
                <th className="p-4 pl-0 text-left">合計:</th>
                <td className="text-right">
                    <Price value={total}/> {noDeliveryCharge && '+ 送料'}
                </td>
            </tr>
            <tr>
                <th className="p-4 pl-0 text-left">内 消費税 10%:</th>
                <td className="text-right"><Price value={tax10ofTotal} hiddenTax/></td>
            </tr>
            <tr>
                <th className="p-4 pl-0 text-left">内 消費税 8%:</th>
                <td className="text-right"><Price value={tax8ofTotal} hiddenTax/></td>
            </tr>
            {!noChargePoint && (
                <tr>
                    <th className="p-4 pl-0 text-left">付与ポイント:</th>
                    <td className="text-right"><Price value={chargePoint} hiddenTax/></td>
                </tr>
            )}
        </tfoot>
    </table>
}