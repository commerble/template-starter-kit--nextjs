import Link from 'next/link'
import cms from '../libs/cms'
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Price } from "../components/Price";

export default function Home({data}) {
  return (<>
    <Header/>
    <main className="flex flex-col items-center">
      <section className="bg-white flex flex-row flex-wrap justify-center p-4 md:p-16 gap-4 md:gap-8 w-full md:w-2/3">
        <h2 className="w-full text-center">ITEMS</h2>
        {data.products.map(product => (
          <article className="w-36 md:w-40 cursor-pointer" key={product.id}>
            <Link href={`/item/${product.id}`} className="image image-squircle">
              <img src={product.thumbnail + '?w=200&h=200'} alt={product.name}/>
            </Link>
            <p className="h-16 flex items-center">{product.name}</p>
            <p className="text-right">
              <Price value={product.price} hiddenTax mark/>
            </p>
          </article>)
        )}
      </section>
    </main>
    <Footer/>
  </>)
}

export async function getServerSideProps(ctx) {
  const data = await cms('/');

  return { props: { data: data } }
}