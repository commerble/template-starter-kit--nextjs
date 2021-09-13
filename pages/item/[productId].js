import { get } from "../../libs/cbpaas";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Price } from "../../components/Price";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/dist/client/router";

export default function Home({data}) {
  const router = useRouter();
  const item = data.products[0];
  const [mainImage, setMainImage] = useState(item.images[0]);

  const cartin = async () => {
    const res = await axios.post('/api/cart', [{item: item.id}])
    if (res.status === 200) {
      router.push('/cart');
    }
  }
    
  return (<>
    <Header/>
    <main className="flex flex-col items-center">
      <div className="w-full p-16 flex flex-row gap-8">
        <section className="w-1/2 flex-grow">
          <div className="image image-square">
            <img src={mainImage.url} alt={item.name}/>
          </div>
        </section>
        <section className="w-1/2 flex-grow bg-white rounded-xl p-8 flex flex-col gap-4">
          <h1>{item.name}</h1>
          <h2>{item.summary}</h2>
          <p><Price value={data.unitPrice}/></p>
          <p>{item.detail}</p>
          <span className="flex-grow"></span>
          <button className="btn-blue" onClick={cartin}>CART IN</button>
        </section>
        </div>
      {/* <pre className="w-full overflow-x-scroll">{"//DEBUG\n" + JSON.stringify(data, null, '\t')}</pre> */}
    </main>
    <Footer/>
  </>)
}

export async function getServerSideProps(ctx) {
  const res = await get(ctx, '/item/' + ctx.params.productId);

  if (res.statusCode !== 200)
    throw new Error(res.statusMessage);

  const data = JSON.parse(res.body);

  return { props: { data: data } }
}