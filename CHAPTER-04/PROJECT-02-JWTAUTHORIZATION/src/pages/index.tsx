import type { NextPage } from 'next'
import Head from 'next/head'
import { FormEvent, useState } from 'react'
import { useAuthContext } from '../context/useAuthContext'
import styles from '../styles/Home.module.css'
import { withSSRGuest } from '../utils/withSSRGuest'

const Home: NextPage = () => {
  const { signIn } = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = {
      email,
      password,
    }

    await signIn(data)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>JWT Auth</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <form className={styles.main} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className={styles.input}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button className={styles.btn} type="submit">
          Sign In
        </button>
      </form>
    </div>
  )
}

export default Home

export const getServerSideProps = withSSRGuest(async (context) => {
  return { props: {} }
})
