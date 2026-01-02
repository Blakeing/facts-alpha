<template>
  <div class="location-general">
    <v-row>
      <!-- Basic Info -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Location Information">
          <v-row dense>
            <v-col
              cols="12"
              sm="4"
            >
              <FTextField
                v-model="model.identifier"
                field="identifier"
                label="Location ID"
                placeholder="e.g., FH001"
              />
            </v-col>
            <v-col
              cols="12"
              sm="8"
            >
              <FTextField
                v-model="model.name"
                field="name"
                label="Location Name"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <FSelect
                v-model="model.type"
                field="type"
                label="Type"
                :options="locationTypeOptions"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
            >
              <FSwitch
                v-model="model.active"
                color="success"
                field="active"
                label="Active"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>

      <!-- Contact Info -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Contact Information">
          <v-row dense>
            <v-col cols="12">
              <FTextField
                v-model="model.phone"
                field="phone"
                label="Phone"
                placeholder="(555) 555-5555"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="model.email"
                field="email"
                label="Email"
                type="email"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="model.website"
                field="website"
                label="Website"
                placeholder="https://"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="model.taxId"
                field="taxId"
                label="Tax ID"
                placeholder="XX-XXXXXXX"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>
    </v-row>

    <v-row>
      <!-- Physical Address -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Physical Address">
          <v-row dense>
            <v-col cols="12">
              <FTextField
                v-model="model.address1"
                field="address1"
                label="Address Line 1"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="model.address2"
                field="address2"
                label="Address Line 2"
                placeholder="Suite, Unit, etc. (optional)"
              />
            </v-col>
            <v-col
              cols="12"
              sm="5"
            >
              <FTextField
                v-model="model.city"
                field="city"
                label="City"
              />
            </v-col>
            <v-col
              cols="6"
              sm="3"
            >
              <FTextField
                v-model="model.state"
                field="state"
                label="State"
                maxlength="2"
                placeholder="XX"
              />
            </v-col>
            <v-col
              cols="6"
              sm="4"
            >
              <FTextField
                v-model="model.postalCode"
                field="postalCode"
                label="ZIP Code"
              />
            </v-col>
            <v-col cols="12">
              <FTextField
                v-model="model.country"
                field="country"
                label="Country"
              />
            </v-col>
          </v-row>
        </FCard>
      </v-col>

      <!-- Mailing Address -->
      <v-col
        cols="12"
        md="6"
      >
        <FCard title="Mailing Address">
          <v-row dense>
            <v-col cols="12">
              <FSwitch
                v-model="model.mailingSameAsPhysical"
                color="primary"
                field="mailingSameAsPhysical"
                label="Same as physical address"
              />
            </v-col>
            <template v-if="!model.mailingSameAsPhysical">
              <v-col cols="12">
                <FTextField
                  v-model="model.mailingAddress1"
                  field="mailingAddress1"
                  label="Address Line 1"
                />
              </v-col>
              <v-col cols="12">
                <FTextField
                  v-model="model.mailingAddress2"
                  field="mailingAddress2"
                  label="Address Line 2"
                  placeholder="Suite, Unit, PO Box (optional)"
                />
              </v-col>
              <v-col
                cols="12"
                sm="5"
              >
                <FTextField
                  v-model="model.mailingCity"
                  field="mailingCity"
                  label="City"
                />
              </v-col>
              <v-col
                cols="6"
                sm="3"
              >
                <FTextField
                  v-model="model.mailingState"
                  field="mailingState"
                  label="State"
                  maxlength="2"
                  placeholder="XX"
                />
              </v-col>
              <v-col
                cols="6"
                sm="4"
              >
                <FTextField
                  v-model="model.mailingPostalCode"
                  field="mailingPostalCode"
                  label="ZIP Code"
                />
              </v-col>
              <v-col cols="12">
                <FTextField
                  v-model="model.mailingCountry"
                  field="mailingCountry"
                  label="Country"
                />
              </v-col>
            </template>
          </v-row>
        </FCard>
      </v-col>
    </v-row>

    <!-- Licenses -->
    <v-row>
      <v-col cols="12">
        <FCard title="Licenses">
          <template #actions>
            <FButton
              intent="tonal"
              prepend-icon="mdi-plus"
              size="small"
              @click="addLicense"
            >
              Add License
            </FButton>
          </template>

          <v-table
            v-if="model.licenses.length > 0"
            density="comfortable"
          >
            <thead>
              <tr>
                <th>License Type</th>
                <th>License Number</th>
                <th style="width: 80px"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(license, index) in model.licenses"
                :key="license.id || index"
              >
                <td style="width: 200px">
                  <FSelect
                    v-model="license.licenseType"
                    density="compact"
                    :field="`licenses.${index}.licenseType`"
                    hide-details
                    :options="licenseTypeOptions"
                  />
                </td>
                <td>
                  <FTextField
                    v-model="license.licenseNumber"
                    density="compact"
                    :field="`licenses.${index}.licenseNumber`"
                    hide-details
                  />
                </td>
                <td>
                  <v-btn
                    color="error"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    @click="removeLicense(index)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>

          <div
            v-else
            class="text-center text-medium-emphasis pa-6"
          >
            <v-icon
              icon="mdi-certificate-outline"
              size="48"
            />
            <p class="mt-2">No licenses added yet</p>
          </div>
        </FCard>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
  import type { LocationFormValues } from '@/entities/location'
  import { locationLicenseTypeOptions, locationTypeOptions } from '@/entities/location'
  import { getDefaultLicenseFormValues } from '@/entities/location'
  import { FButton, FCard, FSelect, FSwitch, FTextField } from '@/shared/ui'

  const model = defineModel<LocationFormValues>({ required: true })

  // Options for select fields
  const licenseTypeOptions = locationLicenseTypeOptions

  function addLicense() {
    model.value.licenses.push(getDefaultLicenseFormValues())
  }

  function removeLicense(index: number) {
    model.value.licenses.splice(index, 1)
  }
</script>

<style scoped>
  .location-general {
    max-width: 1200px;
  }
</style>
