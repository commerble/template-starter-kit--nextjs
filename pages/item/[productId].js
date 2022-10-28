import { useState } from "react";
import { useRouter } from "next/dist/client/router";
import { SunIcon } from "@heroicons/react/outline";
import cms from '../../libs/cms'
import useCommerble from "../../libs/commerble";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Price } from "../../components/Price";

export default function Home({data}) {
  const router = useRouter();
  const item = data.products[0];
  const [mainImage, setMainImage] = useState(item.images[0]);
  const [isLoading, setLoading] = useState(false);
  const cb = useCommerble();

  const cartin = async () => {
    setLoading(true);
    try {
      await cb.appendLines([{item: item.id, qty: 1}]);
      router.push('/cart');
    }
    finally {
      setLoading(false);
    }
  }
    
  return (<>
    <Header/>
    <main className="flex flex-col items-center">
      <div className="w-full flex flex-col md:flex-row p-0 md:p-16 gap-0 md:gap-8">
        <section className="flex-1">
          <div className="image image-square">
            <img src={mainImage.url} alt={item.name}/>
          </div>
        </section>
        <section className="flex-1 bg-white rounded-xl p-8 flex flex-col gap-4">
          <h1>{item.name}</h1>
          <h2>{item.summary}</h2>
          <p><Price value={data.unitPrice}/></p>
          <p>{item.detail}</p>
          <span className="flex-grow"></span>
          <button className="btn-blue" onClick={cartin}>
            {isLoading ? (<SunIcon className="inline-block w-6 h-6 animate-spin"/>):(<>CART IN</>)}
          </button>
        </section>
        </div>
    </main>
    <Footer/>
  </>)
}

export async function getServerSideProps(ctx) {
  const data = await cms('/item/' + ctx.params.productId);

  return { props: { data: data } }
}