import { PropsWithChildren, useEffect, useRef } from "react";

type Props = {
    trigger: unknown
} & React.HTMLAttributes<HTMLDivElement>;

export const Scrollable: React.FC<PropsWithChildren<Props>> = ({trigger, children, ...props}) => {
    const scrollContainer = useRef<HTMLDivElement>();
    useEffect(() => {
        scrollContainer.current?.scroll({top:0});
    }, [trigger]);
    return <div {...props}>{children}</div>
}