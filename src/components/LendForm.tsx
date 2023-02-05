import { LoanPoolABI } from 'abi/LoanPool'
import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useAccount, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { treasuryABI } from 'abi/Treasury'

const LendForm = () => {
  const [amount, setAmount] = useState(0)
  const [funderDeposit, setFunderDeposit] = useState(0)
  const [funderInterest, setFunderInterest] = useState(0)
  const { address } = useAccount()

  const { config } = usePrepareContractWrite({
    address: '0xfc17Eb6d20Cd687e493Fa113930c2FCb157a014F',
    abi: LoanPoolABI,
    functionName: 'fundPool',
    ...(amount > 0 && {
      overrides: {
        from: address,
        value: ethers.utils.parseEther(amount.toString()),
      },
    }),
  })

  useEffect(() => {
    const ethersProvider = new ethers.providers.JsonRpcProvider('https://api.hyperspace.node.glif.io/rpc/v1')
    const signer = ethersProvider.getSigner(address)
    const loanPoolContract = new ethers.Contract('0xfc17Eb6d20Cd687e493Fa113930c2FCb157a014F', LoanPoolABI, signer)
    const treasureContract = new ethers.Contract('0xEE0095cD876A8Fe365EcFCc7163b3F28123C6898', treasuryABI, signer)

    async function fetchFunderDeposit() {
      let funderAmount = await loanPoolContract.getFundersAmount(address)
      setFunderDeposit(Number(ethers.utils.formatUnits(funderAmount)))
      // console.log('Test', ethers.utils.formatUnits(funderAmount))
    }

    async function fetchFunderInterest() {
      let funderAmount = await treasureContract.getAllocation(address)
      setFunderInterest(Number(ethers.utils.formatUnits(funderAmount)))
      // setFunderDeposit(Number(ethers.utils.formatUnits(funderAmount)))
      // console.log('Test', ethers.utils.formatUnits(funderAmount))
    }

    address && fetchFunderDeposit() && fetchFunderInterest()
  }, [address])

  const { data: applyLoanData, isLoading, isSuccess, write: fundPool } = useContractWrite(config)

  const fundPoolWrite = async (amt: number) => {
    console.log(amt)
    console.log(amt.toString())
    // @ts-ignore
    await fundPool()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // TODO: Handle submit
    event.preventDefault()

    await fundPoolWrite(amount)
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-2xl">
      <div>
        <Form onSubmit={handleSubmit} className="">
          <Form.Group>
            <Form.Label className="text-xl">New Deposit</Form.Label>
            <Form.Control
              type="number"
              name="fund Amount"
              value={amount}
              onChange={e => setAmount(parseInt(e.target.value))}
              required
              className="my-2 w-full appearance-none rounded border-2 border-gray-200 bg-gray-200 py-2 px-4 leading-tight text-gray-700 focus:border-red-500 focus:bg-white focus:outline-none"
            />
          </Form.Group>
          <Button
            type="submit"
            className="primaryBtn mt-1 rounded-full bg-purple-500 py-2 px-4 font-medium text-white hover:bg-purple-700"
          >
            Submit
          </Button>
        </Form>
      </div>
      <div className="mt-6 flex w-full flex-wrap items-center justify-between">
        <div className="flex">
          <text>Total Deposit</text>
        </div>
        <div className="flex flex-row-reverse">
          <text>{funderDeposit} FIL</text>
        </div>
      </div>
      <div className="mt-2 flex w-full flex-wrap items-center justify-between">
        <div className="flex">
          <text>Interest Earned</text>
        </div>
        <div className="flex flex-row-reverse">
          <text>{funderInterest} FIL</text>
        </div>
      </div>
    </div>
  )
}

export default LendForm
