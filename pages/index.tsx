import {
  Center,
  Box,
  Heading,
  FormControl, FormErrorMessage, FormErrorIcon, FormLabel, FormHelperText,
  Input,
  Spacer,
  Text,
  Flex,
  Button
} from '@chakra-ui/react'
import { ArrowForwardIcon } from "@chakra-ui/icons"

import { useForm, FieldError } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup"

import type { KeycloakInstance, KeycloakTokenParsed } from 'keycloak-js'
import { useKeycloak } from '@react-keycloak/ssr'

import axios from "axios"
import { useState } from 'react';



const LOGIN_URL = "localhost:8080/api/v1/login"

type Status = "WaitingUser" | "WaitingServer" | "FailedAuthentication";

interface LoginFormFields {
  email: string
  password: string
}


const loginFormSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required()
});



type ParsedToken = KeycloakTokenParsed & {
  email?: string

  preferred_username?: string

  given_name?: string

  family_name?: string
}

export default function Home() {

  const [status, setStatus] = useState<Status>("WaitingUser")

  const { keycloak } = useKeycloak<KeycloakInstance>();

  const parsedToken: ParsedToken | undefined = keycloak?.tokenParsed;

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,

  } = useForm<LoginFormFields>({
    resolver: yupResolver(loginFormSchema)
  });

  async function processSubmit(values: LoginFormFields) {
    console.log(values);

    setStatus("WaitingServer")
    try {
      await axios.post(LOGIN_URL, {
        email: values.email,
        password: values.password
      });
    } catch (error) {
      setStatus("FailedAuthentication")
    }
  }

  return (
    <Center>
      <Box w="25%" mt={40}>
        <Heading as="h3" size="lg">Login using email/password</Heading>
        <Spacer mt={5} />
        {status === "FailedAuthentication" && <>
          <Text fontSize="lg" fontWeight="bold" color="red.400">Login and password do not match</Text>
          <Spacer mt={5} />
        </>}
        <form onSubmit={handleSubmit(processSubmit)}>
          <FormControl isInvalid={hasError(errors.email)}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input id="email" placeholder="name@email.com"
              {...register("email")}></Input>
            <FormErrorMessage>
              <FormErrorIcon />
              {errors.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>

          <Spacer mt={6} />

          <FormControl isInvalid={hasError(errors.password)}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input id="password" placeholder="name@email.com"
              {...register("password")}></Input>
            <FormErrorMessage>
              <FormErrorIcon />
              {errors.password && errors.password.message}
            </FormErrorMessage>
            <FormHelperText>Never tell your password to anyone</FormHelperText>
          </FormControl>

          <Spacer mt={10} />

          <Flex w="100%" justify="flex-end">
            <Button type="submit" colorScheme="blue" variant="solid" isLoading={isSubmitting}>Login</Button>
          </Flex>
        </form>

        <Button onClick={() => {
          if(keycloak) {
            window.location.href = keycloak.createLoginUrl();
          }
        }}>Login using Keycloak</Button>

        <Text>{`User is ${
        !keycloak?.authenticated ? 'NOT ' : ''
      }authenticated`}</Text>
      <Text>{parsedToken?.preferred_username}</Text>
      </Box>
    </Center>
  )
}

function hasError(error: FieldError | undefined): boolean {
  return error ? true : false;
}