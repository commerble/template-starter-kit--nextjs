import axios from "axios";
import { useRouter } from "next/dist/client/router";

export default function CheckoutStep1Page() {
    const router = useRouter();
    return <main>
        <h1>Login</h1>
        <button onClick={async () => {
            await axios.get('/api/purchase/1?guest=true');
            router.push('/checkout');
        }}>Guest</button>
    </main>
}